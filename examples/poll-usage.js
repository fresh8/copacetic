const Copacetic = require('f8-copacetic')
const level = require('f8-copacetic').dependencyLevel
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

// poll every service until their is a hard dependency failure
copacetic
  .pollAll({ interval: '1 minute 30 seconds' })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      copacetic.stop()
    }
  })

// poll every service until their is a hard dependency failure
copacetic
  .poll({
    interval: '1 minute 30 seconds',
    services: [
      { name: 'My-Http-Service' }
    ]
  })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      copacetic.stop()
    }
  })
