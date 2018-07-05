const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
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
            const command = content.shift()
            const args = content.join(' ')
            const commandObj = this.commands[command]
            const options = commandObj.options

            const channel = message.channel
            if (options.guildCommand && channel.type !== 'text') {
                channel.send(`In order to execute this command you need to be inside a guild!`)
                return
            }

            const member = message.member
            if (options.permissions && !member.hasPermission(options.permissions)) {
                channel.send(`You don't have permissions to execute this command!`)
                return
            }

            if (options.needsVoice && !member.voiceChannel) {
                channel.send(`You need to be in a voice channel in order to execute this command!`)
                return
            }

            message.delete()
            this.commands[command].exec(message, args)
        }
    }

    get logger() {
        return logger
    }

}

module.exports = aFramework