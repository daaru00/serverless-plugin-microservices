const ProgressBar = require('ascii-progress')

module.exports = class Progress extends ProgressBar {
  /**
   * Constructor
   *
   * @param {string} serviceName
   * @param {object} opts
   */
  constructor (serviceName, opts) {
    super({
      ...opts,
      schema: `[${serviceName}] :bar.${opts.color || 'white'} :current/:total :percent :elapseds :etas`,
      total: 10
    })
  }
}
