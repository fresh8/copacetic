const noop = require('node-noop').noop
const HealthStrategy = require('../strategy')

class CopaceticStrategy extends HealthStrategy {
  constructor (adapter, { timeout, nodeContext } = {}) {
    super(timeout)
    this.adapter = adapter
    this.nodeContext = nodeContext
  }

  cleanup () {
  }

  check () {
    this.init()
    return this.adapter.checkHealth(this.nodeContext)
  }

  init () {
    if (this.adapter.init) {
      this.adapter.init({ timeout: this.timeout })
      this.init = noop
    }
  }

  areYouOk (checkResult) {
    return checkResult.isHealthy
  }

  improveSummary (summary, lastCheckResult) {
    if (lastCheckResult) {
      summary.dependencies = lastCheckResult.dependencies
    }
  }
}

module.exports = (adapter, opts) => new CopaceticStrategy(adapter, opts)
