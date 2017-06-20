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
  .registerDependency({
    name: 'My-Database',
    url: 'mongodb://localhost/some-db',
    strategy: {
      type: 'mongodb'
    }
  })

// Check the health of all services once
copacetic
  .checkAll()
  .on('health', (healthInfoArr) => {
    // Do something with the result
    // an array of health info is returned
  })

// Check the health of 2 services once
copacetic
  .check({
    dependencies: [
      { name: 'My-Http-Service', retries: 2 },
      { name: 'My-Database', retries: 5 }
    ]
  })
  .on('health', (heathInfoArr) => {
    // Do something ...
  })

// Poll every service until their is a hard dependency failure
copacetic
  .pollAll({ interval: '1 minute 30 seconds' })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      // Handle degraded state ...
    }
  })
