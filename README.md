# Health
---
A package to help your service check the health of its dependencies.

## Requirements
Node v6.4.0 and above

## Installation
```
npm install copacetic --save
```

### Basic Usage

#### Initialise health
```javascript
const Copacetic = require('copacetic')
const level = require('copacetic').dependencyLevel

const copacetic = Copacetic()
```

#### register a Dependency
```javascript
copacetic.registerDependency({
  name: 'My-Dependency',
  url: 'https://my-Dependency.io',
  // defaults to SOFT
  dependency: level.HARD
})
```

#### deregister a Dependency
```javascript
copacetic.deregisterDependency('My-Dependency')
```

#### check the health of a Dependency
```javascript
copacetic
  .check({
    name: 'My-Dependency',
    retries: 2
  })
  .on('healthy', (Dependency) => {
    /**
     * { name: 'My-Dependency',
     *   healthy: true/false,
     *   lastChecked: Date,
     *   level: 'SOFT'
     * }
     */
  })
  .on('unhealthy', (Dependency) => {
    // handle degraded state...
  })
```

#### check the health of many dependencies
```javascript

// explicitly
copacetic
  .check({
    dependencies: [
      { name: 'My-Dependency', retries: 3 },
      { name: 'My-Other-Dependency', retries: 1 }
    ]
  })
  .on('health', (dependencies) => {
    /*
     * [ { name, healthy, lastCheck } ]...
     */
  })

// shorthand
copacetic
  .checkAll()
  .on('health', (dependencies) => {
    // do something useful...
  })

```

#### poll your dependencies˜
```javascript

// explicitly
copacetic
  .poll({
    dependencies: [
      { name: 'My-Dependency', retries: 3 },
      { name: 'My-Other-Dependency', retries: 1 }
    ],
    interval: '5 seconds'
  })
  .on('health', (dependencies) => {
    /*
     * [ { name, healthy, lastCheck } ]...
     */
  })

// shorthand
copacetic
  .pollAll({
    interval: '5 seconds'
  })
  .on('health', (dependencies) => {
    /*
     * [ { name, healthy, lastCheck } ]...
     */
  })
```

#### Express middleware
```javascript
const Copacetic = require('copacetic')
const Middleware = require('copacetic').Middleware
const express = require('express')

// register health dependencies...

const app = express()

// allow the middleware to poll
app.get('/', Middleware({ health, interval: '5 seconds' }))

// hide the contents of the body, returning a 503 if a hard dependency failure
app.get('/', Middleware({ health, verbose: false }))

// or poll your self
app.get('/', Middleware({ health }))
copacetic.pollAll({ interval: '5 seconds' })

// specify dependencies
app.get('/_internal', Middleware({
  copacetic: aCopacetic
  dependencies: [{
    name: 'my-private-Dependency'
  }]
}))

app.get('/external', Middleware({
  copacetic: bCopacetic
  dependencies: [{
    name: 'my-public-Dependency'
  }]
}))

app.listen(3000)

```
