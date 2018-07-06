const path = require('path')
const aFramework = require('../aFramework/aframework')
const db = aFramework.getDatabase()
const discord = new aFramework(path.join(__dirname, 'commands/'))
const TamagochiHandler = require('./handlers/TamagochiHandler')

const logger = discord.logger
const config = discord.config

db.run(`CREATE TABLE IF NOT EXISTS tamagochi (
    id integer PRIMARY KEY AUTOINCREMENT,
    owner_id varchar(100) UNIQUE,
    hunger_level decimal,
    sadness_level decimal,
    strength_level decimal
);`)

discord.on('ready', () => {
    let readyMessage = config.get('readyMessages')
    const random = Math.floor((Math.random() * (readyMessage.length - 1)) + 1)
    readyMessage = readyMessage[random]
    console.log(`Ambrosio Online!\nPlaying ${readyMessage}\nCreated by iamkryfor#1260\n`)
    discord.user.setPresence({ game: { name: readyMessage }, status: 'online' })
    TamagochiHandler.loadAllTamagochis(discord, discord.configHandler).catch(err => logger.error)
})

discord.login()
