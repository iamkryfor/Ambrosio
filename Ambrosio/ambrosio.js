const path = require('path')
const aFramework = require('../aFramework/aframework')
const discord = new aFramework(path.join(__dirname, 'commands/'))

const logger = discord.logger
const config = discord.config

discord.on('ready', () => {
    let readyMessage = config.get('readyMessages')
    const random = Math.floor((Math.random() * (readyMessage.length - 1)) + 1)
    readyMessage = readyMessage[random]
    console.log(`Ambrosio Online!\nPlaying ${readyMessage}\nCreated by iamkryfor#1260\n`)
    discord.user.setPresence({ game: { name: readyMessage }, status: 'online' })
})

discord.login()
