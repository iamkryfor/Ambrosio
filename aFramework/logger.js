// a simple console logger
module.exports = {
    log: function(msg) {
        console.log(module.exports._message('INFO', msg))
    },
    error: function(msg) {
        console.log(module.exports._message('ERROR', msg))
    },
    warn: function(msg) {
        console.log(module.exports._message('WARN', msg))
    },
    _message: function(type, msg) {
        return `${module.exports._getSystemTime()}[${type}] ${msg}`
    },
    _getSystemTime: function() {
        const date = new Date()

        let hours = date.getHours()
        hours = (hours < 10 ? '0' : '') + hours
        let min = date.getMinutes()
        min = (min < 10 ? '0' : '') + min
        let sec = date.getSeconds()
        sec = (sec < 10 ? '0' : '') + sec

        return `[${hours}:${min}:${sec}]`
    }
}