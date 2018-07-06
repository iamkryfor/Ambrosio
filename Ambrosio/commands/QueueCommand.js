const Command = require('../../aFramework/Command')
const MusicHandler = require('../handlers/MusicHandler')

class QueueCommand extends Command {
    constructor(configHandler) {
        super('queue', configHandler, {
            guildCommand: true
        })
    }

    exec(message, args) {
        const guild = message.guild
        MusicHandler.getHandler(guild, this.config).getQueue(message.channel)
    }
}

module.exports = QueueCommand