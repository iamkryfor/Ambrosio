const Command = require('../../aFramework/Command')
const MusicHandler = require('../handlers/MusicHandler')
const Discord = require('discord.js')
const Permissions = Discord.Permissions.FLAGS

class PlayCommand extends Command {
    constructor(configHandler) {
        super('play', configHandler, {
            guildCommand: true,
            permissions: Permissions.MANAGE_CHANNELS,
            needsVoice: true
        })
    }

    exec(message, args) {
        const guild = message.guild
        const textChannel = message.channel
        const guildMember = message.guildMember
        textChannel.send(MusicHandler.getHandler(guild).playMusic(args, textChannel, guildMember, 0.7))
    }
}

module.exports = PlayCommand