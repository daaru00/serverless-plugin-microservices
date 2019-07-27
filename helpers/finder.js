const glob = require('glob-promise')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = class Finder {
  /**
   * Constructor
   *
   * @param {string} path
   * @param {string} cwd
   */
  constructor (path, cwd) {
    this.path = path
    this.cwd = cwd
    this.services = []
  }

  /**
   * Find all services by path
   */
  async find () {
    const servicesPath = await glob(this.path)
    for (const servicePath of servicesPath) {
      const serverlessDeclaration = yaml.safeLoad(fs.readFileSync(servicePath), 'utf8')
      this.services.push({
        path: path.dirname(path.join(this.cwd, servicePath)),
        name: serverlessDeclaration.service
      })
    }
  }

  /**
   * Filter services
   *
   * @param {string[]} services
   */
  filter (services) {
    this.services = this.services.filter(service => services.includes(service.name))
    return this
  }

  /**
   * Get services
   *
   * @return array
   */
  get () {
    return this.services
  }
}
