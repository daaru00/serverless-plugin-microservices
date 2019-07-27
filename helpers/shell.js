const nrc = require('node-run-cmd')

module.exports = class Shell {
  /**
   * Constructor
   *
   * @param {array} services
   * @param {object} opts
   */
  constructor (services, opts) {
    this.services = services
    this.opts = opts
  }

  /**
   * Execute commands
   *
   * @param {string} command
   * @param {object} handlers
   */
  async execute (command, handlers) {
    const commands = this.services.map(service => ({
      command,
      cwd: service.path
    }))

    return nrc.run(commands, {
      onDone: handlers.onDone,
      onData: handlers.onData,
      onError: handlers.onError,
      mode: this.opts.mode || 'sequential'
    })
  }
}
