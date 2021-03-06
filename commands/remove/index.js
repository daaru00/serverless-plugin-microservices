const _ = require('lodash')
const Shell = require('../../helpers/shell')

class Controller {
  /**
   * Constructor
   */
  constructor () {
    this.description = {
      usage: 'Delete services.',
      lifecycleEvents: [
        'handler'
      ],
      options: {
        strategy: {
          usage:
            'Delete strategy, allowed values: parallel, sequential (e.g. "--strategy \'parallel\'" or "-t \'parallel\'")',
          required: false,
          shortcut: 't'
        },
        stage: {
          usage:
            'Stage of the service (e.g. "--stage \'dev\'" or "-s \'dev\'")',
          required: true,
          shortcut: 's'
        },
        region: {
          usage:
            'Region of the service (e.g. "--region \'us-west-1\'" or "-r \'us-west-1\'")',
          required: false,
          shortcut: 'r'
        },
        profile: {
          usage:
            'AWS profile (e.g. "--profile \'work\'" or "-p \'work\'")',
          required: false,
          shortcut: 'p'
        }
      }
    }
  }

  /**
   * Execute command
   */
  async handler () {
    const services = await this.loadServices()

    this.logger.log(`Initializing all services..`)
    const shell = new Shell(services, {
      mode: this.options.strategy || _.get(this.config, 'strategy', 'parallel')
    })

    let command = `serverless remove --stage ${this.options.stage}`
    if (this.options.region && this.options.region.trim() !== '') {
      command += ` --region ${this.options.region}`
    }
    if (this.options.profile && this.options.profile.trim() !== '') {
      command += ` --profile ${this.options.profile}`
    }

    this.logger.log(`Removing services..`)
    let fail = false
    await shell.execute(command, {
      onError: (msg) => {
        fail = true
        this.logger.error(msg)
      }
    })
    if (fail) {
      throw new Error('An error occurred during service remove')
    }
    this.logger.log(`Services removed`)
  }
}

module.exports = new Controller()
