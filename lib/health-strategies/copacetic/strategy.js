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
    return this.adapter.getHealth()
  }

  areYouOk(checkResult) {
    return checkResult.isHealthy
  }

  improveSummary(summary, lastCheckResult) {
    if(lastCheckResult) {
      summary.dependencies = lastCheckResult.dependencies
    }
  }
}

module.exports = CopaceticStrategy
