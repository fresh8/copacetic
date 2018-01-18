const HealthStrategy = require('../strategy')

class CopaceticStrategy extends HealthStrategy {
  constructor(adapter, { timeout, nodeContext } = {}) {
    super(timeout)
    this.adapter = adapter
    this.nodeContext = nodeContext
  }

  cleanup() {
  }

  check() {
    //TODO support timeout
    return this.adapter.checkHealth(this.nodeContext)
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

module.exports = (adapter, opts) => new CopaceticStrategy(adapter, opts)
