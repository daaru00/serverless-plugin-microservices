const _ = require('lodash')
const Shell = require('../../helpers/shell')

class Controller {
  /**
   * Constructor
   */
  constructor () {
    this.description = {
      usage: 'Depoy services.',
      lifecycleEvents: [
        'handler',
        'removeOld',
        'saveState'
      ],
      options: {
        strategy: {
          usage:
            'Deploy strategy, allowed values: parallel, sequential (e.g. "--strategy \'parallel\'" or "-t \'parallel\'")',
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

    const shell = new Shell(services, {
      mode: this.options.strategy || _.get(this.config, 'strategy', 'sequential')
    })

    let command = `serverles deploy --stage ${this.options.stage}`
    if (this.options.region && this.options.region.trim() !== '') {
      command += ` --region ${this.options.region}`
    }
    if (this.options.profile && this.options.profile.trim() !== '') {
      command += ` --profile ${this.options.profile}`
    }

    this.logger.log(`Deploying services..`)
    let fail = false
    await shell.execute(command, {
      onError: (msg) => {
        fail = true
        this.logger.error(msg)
      }
    })
    if (fail) {
      throw new Error('An error occurred during service deploy')
    }
    this.logger.log(`Services deployed`)
  }

  /**
   * Execute remove old services
   */
  async removeOld () {
    const services = this.services.map(service => service.name)
    const deployedServiceNames = await this.loadState()
    const servicesNamesToDelete = deployedServiceNames.filter(serviceName => services.includes(serviceName) === false)

    let command = `serverles deploy --stage ${this.options.stage}`
    if (this.options.region && this.options.region.trim() !== '') {
      command += ` --region ${this.options.region}`
    }
    if (this.options.profile && this.options.profile.trim() !== '') {
      command += ` --profile ${this.options.profile}`
    }

    const servicesToDelete = await this.loadServices(servicesNamesToDelete)
    const shell = new Shell(servicesToDelete, {
      mode: this.options.strategy || _.get(this.config, 'strategy', 'sequential')
    })

    this.logger.log(`Removing old services..`)
    let fail = false
    await shell.execute(command, {
      onError: (msg) => {
        fail = true
        this.logger.error(msg)
      }
    })
    if (fail) {
      throw new Error('An error occurred during old service remove')
    }
    this.logger.log(`Old services remove`)
  }
}

module.exports = new Controller()
