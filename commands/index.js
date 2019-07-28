const initController = require('./init')
const deployController = require('./deploy')
const removeController = require('./remove')

module.exports = {
  init: {
    command: initController.description,
    controller: initController
  },
  deploy: {
    command: deployController.description,
    controller: deployController
  },
  remove: {
    command: removeController.description,
    controller: removeController
  }
}
