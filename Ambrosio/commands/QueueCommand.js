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
        const argsSplit = args.split(' ')
        let page = parseInt(argsSplit[0])
        if (isNaN(page))
            page = 1
             
        MusicHandler.getHandler(guild, this.config).getQueue(message.channel, page)
    }
}

module.exports = QueueCommand