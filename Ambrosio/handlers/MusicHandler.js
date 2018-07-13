const _ = require('underscore')
const EventEmitter = require('events')
const ytdl = require('ytdl-core')
const aFramework = require('../../aFramework/aframework')

const MusicHandlers = {}
class MusicHandler extends EventEmitter {
    constructor(guild, config) {
        super()
        this.guild = guild
        this.currentMusic = {}
        this.queue = []
        this.config = config

        this.yt = aFramework.getYoutube()
        this.sp = aFramework.getSpotify()

        this.on('playing', this.isPlaying)
        this.on('added', this.addedToQueue)
        this.on('error', console.log) // modify this later

        MusicHandlers[guild.id] = this
    }

    playMusic(query, textChannel, guildMember, voiceChannel, isPlaylist = false) {
        voiceChannel = voiceChannel ? voiceChannel : guildMember.voiceChannel
        if (!voiceChannel)
            return
        
        if (!ytdl.validateURL(query)) {
            const playlistURL = /(?:https:\/\/open\.spotify\.com\/user\/)([A-z0-9]+)(?:\/playlist\/)([A-z0-9]+)/gi.exec(query)
            const playlistURI = /(?:spotify:user:)([A-z0-9]+)(?::playlist:)([A-z0-9]+)/gi.exec(query)
            if ((playlistURL || playlistURI) && this.sp) {
                const userId = playlistURL ? playlistURL[1] : playlistURI[1]
                const playlistId = playlistURL ? playlistURL[2] : playlistURI[2]
                this.sp.getPlaylistTracks(userId, playlistId, { limit: 50 }).then(data => {
                    const tracks = data.body.items
                    tracks.forEach(track => this.playMusic(`${track.track.artists[0].name} - ${track.track.name}`, textChannel, guildMember, true))
                }).catch(err => this.emit('error', err))
            } else {
                this.yt.search(query, 1, { regionCode: 'PT' }).then(results => {
                    if (results.length < 0 || !results[0]) {
                        this.emit('error', 'No matching results')
                        return
                    }
    
                    const res = results[0]
                    if (res.type === 'video') {
                        this.playMusic(res.url, textChannel, guildMember, voiceChannel, isPlaylist)
                    } else if (res.type === 'playlist') {
                        this.yt.getPlaylistByID(res.id).then(pl => {
                            pl.getVideos(30).then(videos => {
                                videos.forEach(video => this.playMusic(video.url, textChannel, guildMember, voiceChannel, true))
                            }) 
                        })
                    }
                }).catch(err => this.emit('error', err))
            }

            return
        }

        ytdl.getInfo(query, (err, info) => {
            if (err) {
                // send error message
                return
            }

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
                guildMember,
                voiceChannel
            }

            if (this.playing) {
                this.queue.push(musicInfo)
                if (!isPlaylist)
                    this.emit('added', musicInfo)
                
                return
            }
            
            this.currentMusic = musicInfo
            this.playFromInfo(musicInfo)
        })
    }

    playFromInfo(info) {
        const voiceChannel = info.voiceChannel
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
        if (!this.playing)
            return

        if (this.queue.length === 0) {
            const voiceChannel = this.currentMusic.voiceChannel
            if (voiceChannel)
                voiceChannel.leave()
                
            this.currentMusic = {}
            return
        } 

        this.playFromInfo(this.queue.shift())
    }

    endMusic() {
        this.queue = []
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
            message.delete({ timeout: info.length * 1000 }).catch(err => {})
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
            message.delete({ timeout: 7000 }).catch(err => {})
        })
    }

    playlistAddedToQueue(info) {
        const memberAvatar = info.guildMember.user.avatarURL({ format: 'png' })
        info.textChannel.send({
            embed: {
                title: info.name,
                description: `*Playlist added to the queue!*`,
                color: this.config.get('defaultColor'),
                footer: {
                    icon_url: memberAvatar,
                    text: `by ${info.guildMember.user.username}`
                },
                thumbnail: {
                    url: info.image
                },
                author: {
                    name: info.owner.name,
                    url: info.owner.url
                }
            }
        }).then(message => {
            message.delete({ timeout: 7000 }).catch(err => {})
        })
    }

    shuffleQueue(channel) {
        if (this.queue.length < 2) {
            channel.send('Cannot suffle this queue!').then(message => {
                message.delete({ timeout: 7000 }).catch(err => {})
            })

            return
        }

        this.queue = _.shuffle(this.queue)
        channel.send('The queue was shuffled!').then(message => {
            message.delete({ timeout: 7000 }).catch(err => {})
        })
    }

    getQueue(channel, queuePage = 1) {
        if (this.queue.length === 0) {
            channel.send('The queue is empty!').then(message => {
                message.delete({ timeout: 7000 }).catch(err => {})
            })

            return
        }

        const embedMax = 5
        const pages = Math.ceil(this.queue.length / embedMax)
        if (queuePage > pages) 
            queuePage = 1

        let offset = 0
        for(let i = 1; i < queuePage; ++i)
            offset += 5

        let j = 0
        const fields = []
        this.queue.forEach((info, id) => {
            const number = id + 1
            if (number <= (embedMax + offset) && id >= offset) {
                fields[j] = {
                    name: info.title,
                    value: info.author.name
                }

                ++j
            }
        })

        channel.send({
            embed: {
                title: `${channel.guild.name}'s Queue`,
                description: `This queue has ${this.queue.length} music(s)`,
                color: this.config.get('defaultColor'),
                footer: {
                    text: `Page ${queuePage} of ${pages}`
                },
                thumbnail: {
                    url: this.queue[0].thumbnail
                },
                fields
            }
        }).then(message => {
            message.delete({ timeout: 15000 }).catch(error => {})
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