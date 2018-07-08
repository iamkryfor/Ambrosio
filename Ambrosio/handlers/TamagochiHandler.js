const EventEmitter = require('events')
const aFramework = require('../../aFramework/aframework')
const db = aFramework.getDatabase()
const _ = require('underscore')

const tamagochis = {}
class TamagochiHandler extends EventEmitter {
    constructor(user, configHandler, options = {}) {
        super()
        this.user = user
        this.configHandler = configHandler
        this.config = configHandler.getConfigFile('config')
        this.hunger_level = options.hunger_level | 0.0
        this.sadness_level = options.sadness_level | 0.0
        this.strength_level = options.strength_level | 0.0

        if (_.isEmpty(options)) {
            db.run('INSERT INTO tamagochi (owner_id, hunger_level, sadness_level, strength_level) VALUES ($owner_id, $hunger_level, $sadness_level, $strength_level)', {
                $owner_id: user.id,
                $hunger_level: this.hunger_level,
                $sadness_level: this.sadness_level,
                $strength_level: this.strength_level
            })
        }

        this.interval = setInterval(() => {
            if (user.presence.status === 'offline')
                return

            if (this.hunger_level === 100 && this.strength_level === 0) {
                TamagochiHandler._sendTamagochiMessage(this.user.dmChannel, 'Your tamagochi died from hunger!')
                this.hunger_level = 0.0
                this.sadness_level = 0.0
                this.strength_level = 0.0
                return
            } else {
                this.hunger_level += this.hunger_level === 100 ? 0 : 10 
                this.sadness_level += this.sadness_level === 100 ? 0 : 10 
                if (this.hunger_level > 70) 
                    this.strength_level -= this.strength_level === 0 ? 0 : 5 
            }

            this.saveDB()
        }, 120 * 60 * 1000) // 2 hours

        tamagochis[user.id] = this
    }

    saveDB() {
        db.run('UPDATE tamagochi SET hunger_level = $hunger_level, sadness_level = $sadness_level, strength_level = $strength_level WHERE owner_id = $owner_id', {
            $owner_id: this.user.id,
            $hunger_level: this.hunger_level,
            $sadness_level: this.sadness_level,
            $strength_level: this.strength_level
        })
    }

    feed(channel) {
        if (this.hunger_level === 0) {
            TamagochiHandler._sendTamagochiMessage(channel, `I'm not hungry fella. Try later!`)
            return
        }

        this.hunger_level -= TamagochiHandler._calculateVar(this.hunger_level)
        this.saveDB()
        TamagochiHandler._sendTamagochiMessage(channel, 'MEAHM. Such a nice steak!')
    }

    play(channel) {
        if (this.hunger_level > 80) {
            TamagochiHandler._sendTamagochiMessage(channel, 'I WANT TO EAT!!')
            return
        }

        if (this.sadness_level !== 0) {
            this.sadness_level -= TamagochiHandler._calculateVar(this.sadness_level)
            this.saveDB()
        }

        TamagochiHandler._sendTamagochiMessage(channel, 'The movie was nice.')
    }

    train(channel) {
        if (this.hunger_level > 80) {
            TamagochiHandler._sendTamagochiMessage(channel, 'I WANT TO EAT!!')
            return
        }

        if (this.strength_level !== 100) {
            this.strength_level += TamagochiHandler._calculateVar(this.strength_level)
            this.saveDB()
        }

        TamagochiHandler._sendTamagochiMessage(channel, `BACA. BACA. No one can defeat me now!`)
    }

    sendTamagochiInfo(channel) {
        channel.send({ 
            embed: {
                title: `${this.user.username}'s Tamagochi`,
                description: `Powered by Ambrósio`,
                color: this.config.get('defaultColor'),
                fields: [
                    {
                        name: `*Hunger Level:*`,
                        value: `***${this.hunger_level}***`,
                        inline: true
                    },
                    {
                        name: `*Sadness Level:*`,
                        value: `***${this.sadness_level}***`,
                        inline: true
                    },
                    {
                        name: `*Strength Level:*`,
                        value: `***${this.strength_level}***`,
                        inline: true
                    }
                ]
            }
        })
    }

    static _calculateVar(a) {
        return Math.floor((Math.random() * ((a * 0.3) - (a * 0.1))) + 5)
    }
    
    static _sendTamagochiMessage(channel, m) {
        if (!channel)
            return

        channel.send(`***TAMAGOCHI:*** ${m}`).then(message => {
            message.delete({ timeout: 7000 }).catch(err => {})
        })
    }

    static loadAllTamagochis(discord, configHandler) {
        return new Promise((resolve, reject) => {
            db.each('SELECT * FROM tamagochi', (err, row) => {
                if (err)
                    reject(err)

                discord.users.fetch(row.owner_id).then(user => {
                    tamagochis[user.id] = new TamagochiHandler(user, configHandler, {
                        hunger_level: row.hunger_level,
                        sadness_level: row.sadness_level,
                        strength_level: row.strength_level
                    })
                    resolve()
                }).catch(err => reject(err))
            })
        })
    }

    static getHandler(user, configHandler) {
        if (tamagochis[user.id])
            return tamagochis[user.id]
            
        return new TamagochiHandler(user, configHandler)
    }
}

module.exports = TamagochiHandler