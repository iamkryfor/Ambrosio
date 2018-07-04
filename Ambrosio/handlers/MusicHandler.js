const _ = require('underscore')
const EventEmitter = require('events')

const MusicHandlers = {}
class MusicHandler extends EventEmitter {
    constructor(guild) {
        super()
        this.guild = guild
        this.currentMusic = {}
        this.queue = {}

        MusicHandlers[guild.id] = this
    }

    playMusic(query, textChannel, guildMember, volume) {
        return `Query: "${query}" TextChannel: "${textChannel.name}" Volume: "${volume}"`
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

    static getHandler(guild) {
        if (MusicHandlers[guild.id])
            return MusicHandlers[guild.id]

        return new MusicHandler(guild)
    }
}

module.exports = MusicHandler