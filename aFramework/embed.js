const Discord = require('discord.js')

class embed {
    constructor(config, color) {
        this.color = color | config.get('defaultColor')
    }

    newEmbed() {
        return new Discord.RichEmbed().setColor(this.color)
    }
}

module.exports = embed