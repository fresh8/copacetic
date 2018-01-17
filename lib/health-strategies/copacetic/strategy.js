const HealthStrategy = require('../strategy')

class CopaceticStrategy extends HealthStrategy {
  constructor(adapter, { timeout } = {}) {
    super(timeout)
    this.adapter = adapter
  }

  cleanup() {
  }

  check() {
    //TODO support timeout
    //TODO pass on more data?
    return this.adapter.getHealth()
  }

  areYouOk(checkResult) {
    return checkResult.isHealthy
  }
}

module.exports = CopaceticStrategy
