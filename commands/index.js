const initController = require('./init')
const deployController = require('./deploy')
const removeController = require('./remove')

module.exports = {
  init: {
    command: initController.description,
    controller: initController.handler
  },
  deploy: {
    command: deployController.description,
    controller: deployController.handler
  },
  remove: {
    command: removeController.description,
    controller: removeController.handler
  }
}
