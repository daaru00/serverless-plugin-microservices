const _ = require('lodash')
const commands = require('./commands')
const Finder = require('./helpers/finder')
const Logger = require('./helpers/logger')

class ServerlessPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options
    this.cwd = process.cwd()
    this.config = _.get(this.serverless.service, 'custom.service', {})

    this.commands = {
      microservices: {
        usage: 'Microservices manager',
        commands: {
          init: commands.init.command,
          deploy: commands.deploy.command
        }
      }
    }
    this.hooks = {
      'microservices:init:handler': commands.init.controller.bind(this),
      'microservices:deploy:handler': commands.deploy.controller.bind(this)
    }

    this.logger = new Logger(this.serverless)
    this.servicesPath = _.get(this.config, 'path', 'node_modules/*/serverless.yml')
    this.finder = new Finder(this.servicesPath, this.cwd)
  }

  /**
   * Load services
   */
  async loadServices () {
    this.logger.log(`Searching for services in '${this.servicesPath}'..`)
    await this.finder.find()
    if (this.config.only && Array.isArray(this.config.only)) {
      this.finder.filter(this.config.only)
    }
    const services = this.finder.get()
    if (services.length === 0) {
      this.logger.warn(`No services found`)
    } else {
      this.logger.log(`Found ${services.length} services`)
    }
    return services
  }
}

module.exports = ServerlessPlugin
