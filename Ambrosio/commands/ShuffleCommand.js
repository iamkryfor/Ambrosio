const Command = require('../../aFramework/Command')
const MusicHandler = require('../handlers/MusicHandler')

class ShuffleCommand extends Command {
    constructor(configHandler) {
        super('shuffle', configHandler, {
            guildCommand: true
        })
    }

    exec(message, args) {
        const guild = message.guild
        MusicHandler.getHandler(guild, this.config).shuffleQueue(message.channel)
    }
}

module.exports = ShuffleCommand