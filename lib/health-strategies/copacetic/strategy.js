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
      .then((health) => {
        if(!health.isHealthy) {
          throw new Error(`${health.name || 'Unnamed dependency'} reported itself as not healthy`)
        }
      })
  }
}

module.exports = CopaceticStrategy
