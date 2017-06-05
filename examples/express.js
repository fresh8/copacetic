const Copacetic = require('@fresh8/copacetic')
const Middleware = require('@fresh8/copacetic').Middleware
const express = require('express')

// register health dependencies...
const copacetic = Copacetic('my-thing')
const app = express()

copacetic
  .registerDependency({
    name: 'My-Http-Service',
    url: 'http://my-http-service.com',
    level: level.HARD
  })

// you might want to keep health information private
/**
 * @example
 * {
 *   service: 'my-thing',
 *   healthy: Boolean,
 *   dependencies: [
 *     {
 *       name: String,
 *       healthy: Boolean,
 *       level: String,
 *       lastChecked: Boolean
 *     }
 *   ]
 * }
 *
 */
app.get('/_descriptiveHealthInformation', Middleware({
  copacetic,
  interval: '5 seconds',
}))

// just returns a status code. 200 if health, 503 if not
// copacetic is already polling, so an inteval is not needed
app.get('/health', Middleware({
  copacetic,
  verbose: false
}))

app.listen(3000)
