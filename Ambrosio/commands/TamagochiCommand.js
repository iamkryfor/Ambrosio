const Command = require('../../aFramework/Command')
const TamagochiHandler = require('../handlers/TamagochiHandler')

class TamagochiCommand extends Command {
    constructor(configHandler) {
        super('tmg', configHandler, {})
    }

    exec(message, args) {
        const channel = message.channel
        const author = message.author
        const argsSplit = args.split(' ')
        const argsLength = (argsSplit.length > 0 && argsSplit[0] === '') ? 0 : argsSplit.length
        const tmg = TamagochiHandler.getHandler(author, this.configHandler)

        const memberMentions = message.mentions.members
        if (argsLength === 0) {
            tmg.sendTamagochiInfo(channel)
        } else {
            if (argsSplit[0] === 'feed') {
                tmg.feed(channel)
            } else if (argsSplit[0] === 'play') {
                tmg.play(channel)
            } else if (argsSplit[0] === 'train') {
                tmg.train(channel)
            } else {
                if (memberMentions.size > 0) {
                    memberMentions.array().forEach(member => TamagochiHandler.getHandler(member.user, this.configHandler).sendTamagochiInfo(channel))
                    return
                }
            }
        }
    }
}

module.exports = TamagochiCommand