const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('database.sqlite3')
const { Config } = require('./config')
const logger = require('./logger')

class aFramework extends Discord.Client {
    constructor(commandsFolder, opts) {
        super(opts)
        // initialize configuration
        this.configHandler = new Config('config')
        this.config = this.configHandler.getConfigFile('config')
        this.prefix = this.config.get('prefix')
        this.enableCommands = (commandsFolder || !fs.existsSync(commandsFolder)) ? commandsFolder : false

        // load all commands
        this._loadCommands()

        this.on('message', this._handleDiscordCommands)
    }

    login() {
        // initalize discord client
        super.login(this.config.get('discordToken')).catch(error => {
            logger.error(error)
            process.exit()
        })
    }

    _loadCommands() {
        if (!this.enableCommands)
            return
        
        const commandObj = {}
        const commands = {}
        let commandsFolder = this.enableCommands
        commandsFolder = fs.readdirSync(commandsFolder)
        commandsFolder.forEach(fileName => {
            const cName = fileName.split('.')[0]
            const commandPath = path.join(this.enableCommands, fileName)
            commandObj[cName] = require(commandPath)
            const cmd = new commandObj[cName](this.configHandler)
            commands[cmd.command] = cmd
        })

        this.commands = commands
    }

    _handleDiscordCommands(message) {
        if (!this.enableCommands || message.author.id === this.user.id)
            return

        let content = message.content
        if (content.startsWith(this.prefix)) {
            content = content.substr(1).split(' ')
            const channel = message.channel
            const command = content.shift()
            const args = content.join(' ')
            const commandObj = this.commands[command]
            if (channel.type === 'text')
                message.delete()

            if (!commandObj) {
                aFramework._sendError(channel, `That command doesn't exist!`)
                return
            }

            const options = commandObj.options
            if (options.guildCommand && channel.type !== 'text') {
                aFramework._sendError(channel, `In order to execute this command you need to be inside a guild!`)
                return
            }

            const member = message.member
            if (options.permissions && !member.hasPermission(options.permissions)) {
                aFramework._sendError(channel, `You don't have permissions to execute this command!`)
                return
            }

            if (options.needsVoice && !member.voiceChannel) {
                aFramework._sendError(channel, `You need to be in a voice channel in order to execute this command!`)
                return
            }

            const argsSplit = args.split(' ')
            const argsLength = (argsSplit.length > 0 && argsSplit[0] === '') ? 0 : argsSplit.length
            if (options.minArgs && argsLength < options.minArgs) {
                aFramework._sendError(channel, `This command needs at least ${options.minArgs} argument(s) to be executed!`)
                return
            }

            this.commands[command].exec(message, args)
        }
    }

    get logger() {
        return logger
    }

    static _sendError(channel, error) {
        channel.send(`[ERROR] ${error}`).then(message => { 
            message.delete({ timeout: 7000 }).catch(error => {})
        })
    }

    static getDatabase() {
        return db
    }
}

module.exports = aFramework