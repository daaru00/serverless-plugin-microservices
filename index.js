const _ = require('lodash')
const commands = require('./commands')
const Finder = require('./helpers/finder')
const Logger = require('./helpers/logger')
const StateStore = require('./helpers/state-store')

class ServerlessPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options
    this.cwd = process.cwd()
    this.provider = this.serverless.getProvider('aws')
    this.config = _.get(this.serverless.service, 'custom.service', {})
    this.service = this.serverless.service.getServiceObject()

    this.commands = {
      microservices: {
        usage: 'Microservices manager',
        commands: {
          init: commands.init.command,
          deploy: commands.deploy.command,
          delete: commands.delete.command
        }
      }
    }
    this.hooks = {
      // Init
      'microservices:init:handler': commands.init.controller.handler.bind(this),
      // Deploy
      'microservices:deploy:handler': commands.deploy.controller.handler.bind(this),
      'microservices:deploy:removeOld': commands.deploy.controller.removeOld.bind(this),
      'microservices:deploy:saveState': this.saveState.bind(this),
      // Delete
      'microservices:delete:handler': commands.delete.controller.handler.bind(this),
      'microservices:delete:deleteState': this.deleteState.bind(this)
    }

    this.logger = new Logger(this.serverless)
    this.servicesPath = _.get(this.config, 'path', 'node_modules/*/serverless.yml')
    this.finder = new Finder(this.servicesPath, this.cwd)
    this.stateStore = new StateStore(this.provider, _.get(this.config, 'state.ssmParameter', `/${this.service.name}/microservices/deployed`))
  }

  /**
   * Load services
   *
   * @param {string[]} filter
   */
  async loadServices (filter) {
    this.services = []
    this.logger.log(`Searching for services in '${this.servicesPath}'..`)
    await this.finder.find()
    if (!filter && this.config.only && Array.isArray(this.config.only)) {
      this.finder.filter(this.config.only)
    } else if (filter && Array.isArray(filter)) {
      this.finder.filter(filter)
    }
    this.services = this.finder.get()
    if (this.services.length === 0) {
      this.logger.warn(`No services found`)
    } else {
      this.logger.log(`Found ${this.services.length} services`)
    }
    return this.services
  }

  /**
   * Load state
   */
  async loadState () {
    this.logger.log(`Loading state from SSM..`)
    await this.stateStore.load()
    this.logger.log(`State loaded`)
    return this.stateStore.getValue()
  }

  /**
   * Save state
   */
  async saveState () {
    this.logger.log(`Save state to SSM..`)
    this.stateStore.setValue(this.services.map(service => service.name))
    await this.stateStore.save()
    this.logger.log(`State saved`)
  }

  /**
   * Delete state
   */
  async deleteState () {
    this.logger.log(`Deleting state from SSM..`)
    await this.stateStore.delete()
    this.logger.log(`State deleted`)
  }
}

module.exports = ServerlessPlugin
