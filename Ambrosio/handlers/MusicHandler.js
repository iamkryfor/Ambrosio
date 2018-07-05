const _ = require('underscore')
const EventEmitter = require('events')
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const yt = new YouTube('AIzaSyAvKBZ6XDNtauVMW_Hi25TGjhM72DOBY0U')

const MusicHandlers = {}
class MusicHandler extends EventEmitter {
    constructor(guild, config) {
        super()
        this.guild = guild
        this.currentMusic = {}
        this.queue = []
        this.config = config

        this.on('playing', this.isPlaying)
        this.on('added', this.addedToQueue)

        MusicHandlers[guild.id] = this
    }

    playMusic(query, textChannel, guildMember) {
        if (!ytdl.validateURL(query)) {
            const playlistRegex = /(?:https:\/\/www\.youtube\.com\/playlist\?list=)([0-9A-z]+)+(?:.*)/gi.exec(query)

            yt.searchVideos(query, 1, { regionCode: 'PT' }).then(results => {
                if (results.length < 0) {
                    this.emit('error', 'No matching results')
                    return
                }

                const res = results[0]
                this.playMusic(res.url, textChannel, guildMember)
            }).catch(error => this.emit('error', error))
            return
        }

        ytdl.getInfo(query, (err, info) => {
            const musicInfo = {
                url: query,
                title: info.title,
                thumbnail: info.thumbnail_url,
                author: {
                    name: info.author.name,
                    avatar: info.author.avatar,
                    url: info.author.user_url
                },
                length: info.length_seconds,
                textChannel,
                guildMember
            }

            if (this.playing) {
                this.queue.push(musicInfo)
                this.emit('added', musicInfo)
                return
            }
            
            this.currentMusic = musicInfo
            this.playFromInfo(musicInfo)
        })
    }

    playFromInfo(info) {
        const voiceChannel = info.guildMember.voiceChannel
        voiceChannel.join().then(connection => {
            info.stream = ytdl(info.url, { fiter: 'audioonly' })
            info.dispatcher = connection.play(info.stream, { volume: false, passes: 3 })

            info.dispatcher.on('start', () => {
                this.currentMusic = info
                this.emit('playing', info)
            })

            info.dispatcher.on('end', () => {
                this.skipMusic()
            })

            info.dispatcher.on('error', () => {
                info.dispatcher.emit('end')
                this.emit('error', 'Dispatcher error!')
            })
        }).catch(error => {
            this.emit('error', error)
        })
    }

    skipMusic() {
        if (this.queue.length === 0) {
            this.currentMusic.guildMember.voiceChannel.leave()
            this.currentMusic = {}
            return
        }

        this.playFromInfo(this.queue.shift())
    }

    endMusic() {
        this.queue = {}
        this.skipMusic()
    }

    isPlaying(info) {
        const memberAvatar = info.guildMember.user.avatarURL({ format: 'png' })
        info.textChannel.send({
            embed: {
                title: info.title,
                description: `*Now Playing **(${MusicHandler._secToHMS(info.length)})***`,
                color: this.config.get('defaultColor'),
                footer: {
                    icon_url: memberAvatar,
                    text: `from ${info.guildMember.user.username}`
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
        }).then(message => {
            message.delete({ timeout: info.length * 1000 }).catch(error => {})
        })
    }

    addedToQueue(info) {
        const memberAvatar = info.guildMember.user.avatarURL({ format: 'png' })
        info.textChannel.send({
            embed: {
                title: info.title,
                description: `*Added to the queue!\nLength: **${MusicHandler._secToHMS(info.length)}***`,
                color: this.config.get('defaultColor'),
                footer: {
                    icon_url: memberAvatar,
                    text: `by ${info.guildMember.user.username}`
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
        }).then(message => {
            message.delete({ timeout: 10000 }).catch(error => {})
        })
    }

    get playing() {
        if (_.isEmpty(this.currentMusic))
            return false
        
        return this.currentMusic
    }

    static _secToHMS(s) {
        let hours = Math.floor(s / 3600)
        hours = (hours < 10 ? '0' : '') + hours
        let min = Math.floor((s % 3600) / 60)
        min = (min < 10 ? '0' : '') + min
        let sec = Math.floor((s % 3600) % 60)
        sec = (sec < 10 ? '0' : '') + sec

        return `${hours}:${min}:${sec}`
    }
    
    static getHandler(guild, config) {
        if (MusicHandlers[guild.id])
            return MusicHandlers[guild.id]

        return new MusicHandler(guild, config)
    }
}

module.exports = MusicHandler