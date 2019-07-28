module.exports = class StateStore {
  /**
   * Constructor
   *
   * @param {array} provider
   * @param {object} key
   */
  constructor (provider, key) {
    this.provider = provider
    this.key = key
    this.value = null
  }

  /**
   * Load state
   */
  async load () {
    const response = await this.provider.request('SSM', 'getParameter', {
      Name: this.key,
      WithDecryption: false
    })
    const parameter = response.Parameter
    if (parameter === null) {
      return
    }
    this.value = parameter.Type === 'StringList' ? parameter.Value.split(',') : parameter.Value
  }

  /**
   * Get state value
   *
   * @returns {string|string[]}
   */
  getValue () {
    return this.value
  }

  /**
   * Set state value
   *
   * @param {string|string[]} value
   */
  setValue (value) {
    this.value = value
  }

  /**
   * Save state
   */
  async save () {
    await this.provider.request('SSM', 'putParameter', {
      Name: this.key,
      Type: Array.isArray(this.value) ? ' StringList' : 'String',
      Value: Array.isArray(this.value) ? this.value.join(',') : this.value,
      Overwrite: true
    })
  }

  /**
   * Delete state
   */
  async delete () {
    await this.provider.deleteParameter('SSM', 'putParameter', {
      Name: this.key
    })
  }
}
