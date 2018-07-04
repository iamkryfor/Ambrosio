const logger = require('./logger')
const embed = require('./embed')

class Command {
    constructor(command, configHandler, options = {}) {
        this.configHandler = configHandler
        this.config = configHandler.getConfigFile('config')
        this.command = command
        this.options = options
        this.embed = new embed(this.config)
    }

    exec(message, args) {
        logger.error(`Method exec() not implemented in ${this.command} command!`)
        process.exit()
    }
}

module.exports = Command