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
  .registerDependency({
    name: 'My-Database',
    url: 'mongodb://localhost/some-db',
    healthStrategy: 'mongodb'
  })

// check the health of all services once
copacetic
  .checkAll()
  .on('health', (healthInfoArr) => {
    // do something with the result
    // an array of health info is returned
  })

// check the health of 2 services once
copacetic
  .check({
    dependencies: [
      { name: 'My-Http-Service', retries: 2 },
      { name: 'My-Database', retries: 5 }
    ]
  })
  .on('health', (heathInfoArr) => {
    // do something

  })

// poll every service until their is a hard dependency failure
copacetic
  .pollAll({ interval: '1 minute 30 seconds' })
  .on('health', (healthInfoArr) => {
    if (!copacetic.isHealthy) {
      copacetic.stop()
    }
  })
