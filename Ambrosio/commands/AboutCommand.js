const Command = require('../../aFramework/Command')

class AboutCommand extends Command {
    constructor(configHandler) {
        super('about', configHandler, {})
    }

    exec(message, args) {
        const channel = message.channel
        const embed = {
            title: `About this bot`,
            description: `Ambrósio - The discord bot - is a bot created by @iamkryfor#1260 therefore if you have any problem **DO NOT** contact him at all. That's it for now, thanks!`,
            color: this.config.get('defaultColor')
        }
        
        channel.send({ embed })
    }
}

module.exports = AboutCommand