const _ = require('lodash')
const Shell = require('../../helpers/shell')

class Controller {
  /**
   * Constructor
   */
  constructor () {
    this.description = {
      usage: 'Initialize services installing NPM dependencies.',
      lifecycleEvents: [
        'handler'
      ],
      options: {
        strategy: {
          usage:
            'Deploy strategy, allowed values: parallel, sequential (e.g. "--strategy \'parallel\'" or "-t \'parallel\'")',
          required: false,
          shortcut: 't'
        }
      }
    }
  }

  /**
   * Execute command
   */
  async handler () {
    const services = await this.loadServices()

    this.logger.log(`Initializing services..`)
    const shell = new Shell(services, {
      mode: this.options.strategy || _.get(this.config, 'strategy', 'sequential')
    })
    let fail = false
    await shell.execute('npm install --loglevel=error', {
      onError: (msg) => {
        fail = true
        this.logger.error(msg)
      }
    })
    if (fail) {
      throw new Error('An error occurred during service initialization')
    }
    this.logger.log(`Services initialized`)
  }
}

module.exports = new Controller()
