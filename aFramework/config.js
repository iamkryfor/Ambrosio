const path = require('path')
const fs = require('fs')
const logger = require('./logger')

class Config {
    constructor(configFolder) {
        if (!fs.existsSync(configFolder))
            fs.mkdirSync(configFolder)
            
        this.configFolder = configFolder
    }

    getConfigFile(fileName) {
        fileName = (!fileName.endsWith('.json') ? fileName + '.json' : fileName)
        const filePath = path.join(this.configFolder, fileName)

        if (!fs.existsSync(filePath)) {
            logger.error(`The file ${filePath} does not exist!`)
            return false
        }

        return new ConfigFile(path.join('..', filePath))
    }   
}

class ConfigFile {
    constructor(filePath) {
        this.file = require(filePath)
    }

    get(key) {
        let splittedKey = key.split('.')
        key = this.file
        splittedKey.forEach(next => {
            if (!key) 
                return undefined

            key = key[next]
        })

        return key
    }
}

module.exports = { Config, ConfigFile }