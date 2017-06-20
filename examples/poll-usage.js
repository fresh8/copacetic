const Copacetic = require('@fresh8/copacetic')
const level = require('@fresh8/copacetic').dependencyLevel
const copacetic = Copacetic('My-Thing')

copacetic
  .registerDependency({
    name: 'My-Http-Service',
    url: 'http://my-http-service.com',
    level: level.HARD
  })
  .registerDependency({
    name: 'My-Soft-Http-Service-Dependency',
    url: 'http://example.com',
  })

// Poll every service until their is a hard dependency failure
copacetic
  .pollAll({ interval: '1 minute 30 seconds' })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      copacetic.stop()
    }
  })

// Poll every service until their is a hard dependency failure
copacetic
  .poll({
    interval: '1 minute 30 seconds',
    services: [
      { name: 'My-Http-Service' }
    ]
  })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      // Handle degraded state ...
    }
  })
