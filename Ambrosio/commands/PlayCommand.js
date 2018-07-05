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
        const guildMember = message.member
        
        const memberAvatar = guildMember.user.avatarURL({ format: 'png' })
        const musicHandler = MusicHandler.getHandler(guild, this.config)
        musicHandler.once('playing', info => {
            textChannel.send({
                embed: {
                    title: info.title,
                    description: `*Now Playing **(${MusicHandler._secToHMS(info.length)})***`,
                    color: this.config.get('defaultColor'),
                    footer: {
                        icon_url: memberAvatar,
                        text: `from ${guildMember.user.username}`
                    },
                    thumbnail: {
                        url: info.thumbnail
                    },
                    author: {
                        name: info.author.name,
                        url: info.author.url,
                        icon_url: info.author.avatar
                    }
                }
            }).then(message => message.delete({ timeout: info.length * 1000 }))
        })

        musicHandler.once('added', (info) => {
            textChannel.send({
                embed: {
                    title: info.title,
                    description: `*Added to the queue!\nLength: **${MusicHandler._secToHMS(info.length)}***`,
                    color: this.config.get('defaultColor'),
                    footer: {
                        icon_url: memberAvatar,
                        text: `by ${guildMember.user.username}`
                    },
                    thumbnail: {
                        url: info.thumbnail
                    },
                    author: {
                        name: info.author.name,
                        url: info.author.url,
                        icon_url: info.author.avatar
                    }
                }
            }).then(message => message.delete({ timeout: 10000 }))
        })

        musicHandler.playMusic(args, textChannel, guildMember)
    }
}

module.exports = PlayCommand