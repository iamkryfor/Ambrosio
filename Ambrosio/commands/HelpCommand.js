const Command = require('../../aFramework/Command')

class HelpCommand extends Command {
    constructor(configHandler) {
        super('help', configHandler, {})
    }

    exec(message, args) {
        const channel = message.channel
        const embed = {
            title: `Click here to go`,
            description: `Find out the finest commands and coming features!`,
            color: this.config.get('defaultColor'),
            url: 'https://gist.github.com/iamkryfor/d080178d05dbe67f1aad1095f68a1ad8'
        }
        
        channel.send({ embed })
    }
}

module.exports = HelpCommand