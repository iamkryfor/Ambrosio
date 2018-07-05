const _ = require('underscore')
const EventEmitter = require('events')
const ytdl = require('ytdl-core')

const MusicHandlers = {}
class MusicHandler extends EventEmitter {
    constructor(guild) {
        super()
        this.guild = guild
        this.currentMusic = {}
        this.queue = []

        MusicHandlers[guild.id] = this
    }

    playMusic(query, textChannel, guildMember) {
        if (!ytdl.validateURL(query)) {
            // search youtube
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
                if (this.queue.length === 0) {
                    this.currentMusic = {}
                    voiceChannel.leave()
                    return
                }

                this.playFromInfo(this.queue.shift())
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

    }

    endMusic() {

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
    
    static getHandler(guild) {
        if (MusicHandlers[guild.id])
            return MusicHandlers[guild.id]

        return new MusicHandler(guild)
    }
}

module.exports = MusicHandler