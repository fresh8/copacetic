import * as Copacetic from '@fresh8/copacetic'

const copacetic = Copacetic('my-service')

copacetic
  .registerDependency({
    name: 'hard-http',
    url: 'http://hard-dep.com',
    level: Copacetic.dependencyLevel.HARD
  })
  .registerDependency({
    name: 'soft-http',
    url: 'http://soft-dep.com'
  })
  .registerDependency({
    name: 'database',
    url: 'mongodb://localhost/some-collection',
    strategy: {
      type: 'mongodb'
    }
  })

// Check the health of all services once
copacetic
  .checkAll()
  .on('health', (healthInfo: Array<Copacetic.Health>) => {
    // ... do something with the health info
  })

// Check the health of 2 services
copacetic
  .check({
    dependencies: [
      { name: 'My-Http-Service', retries: 2 },
      { name: 'My-Database', retries: 5 }
    ]
  })
  .on('health', (heathInfoArr: Array<Copacetic.Health>) => {
    // Do something ...
  })

// Poll every service until their is a hard dependency failure
copacetic
  .pollAll({ interval: '1 minute 30 seconds' })
  .on('health', (healthInfoArr : Array<Copacetic.Health>, stop) => {
    if (!copacetic.isHealthy) {
      // Handle degraded state ...
      stop()
    }
  })

// Poll 'My-Http-Service' service until their is a hard dependency failure
// you probably wouldn't do this, but as an example of using stop...
copacetic
  .poll({
    interval: '1 minute 30 seconds',
    services: [
      { name: 'My-Http-Service' }
    ]
  })
  .on('health', (healthInfoArr: Array<Copacetic.Health>, stop) => {
    if (!copacetic.isHealthy) {
      // Handle degraded state ...
      stop()
    }
  })
