const Command = require('../../aFramework/Command')
const MusicHandler = require('../handlers/MusicHandler')
const Discord = require('discord.js')
const Permissions = Discord.Permissions.FLAGS

class PlayCommand extends Command {
    constructor(configHandler) {
        super('play', configHandler, {
            guildCommand: true,
            permissions: Permissions.MANAGE_CHANNELS,
            needsVoice: true,
            minArgs: 1
        })
    }

    exec(message, args) {
        const guild = message.guild
        const textChannel = message.channel
        const guildMember = message.member
        
        MusicHandler.getHandler(guild, this.config).playMusic(args, textChannel, guildMember, guildMember.voiceChannel)
    }
}

module.exports = PlayCommand