const Command = require('../../aFramework/Command')

class AboutCommand extends Command {
    constructor(configHandler) {
        super('about', configHandler, {})
    }

    exec(message, args) {
        let channel = message.channel
        const embed = this.embed.newEmbed()
            .setTitle('About this bot')
            .setDescription(`Ambrósio - The discord bot - is a bot created by @iamkryfor#1260 therefore if you have any problem **DO NOT** contact him at all. That's it for now, thanks!`)
        channel.send(embed)
    }
}

module.exports = AboutCommand