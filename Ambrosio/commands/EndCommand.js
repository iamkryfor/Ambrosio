const Command = require('../../aFramework/Command')
const MusicHandler = require('../handlers/MusicHandler')
const Discord = require('discord.js')
const Permissions = Discord.Permissions.FLAGS

class PlayCommand extends Command {
    constructor(configHandler) {
        super('end', configHandler, {
            guildCommand: true,
            permissions: Permissions.MANAGE_CHANNELS
        })
    }

    exec(message, args) {
        const guild = message.guild
        MusicHandler.getHandler(guild, this.config).endMusic()
    }
}

module.exports = PlayCommand