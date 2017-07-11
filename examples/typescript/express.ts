import * as express from 'express'
import * as Copacetic from '@fresh8/copacetic'
// const Middleware = require('@fresh8/copacetic').Middleware
// const express = require('express')

// Register health dependencies...
const copacetic = Copacetic('my-thing')
const app = express()

copacetic
  .registerDependency({
    name: 'My-Http-Service',
    url: 'http://my-http-service.com',
    level: Copacetic.dependencyLevel.HARD
  })

// You might want to keep health information private
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

// Just returns a status code. 200 if health, 503 if not
// Copacetic is already polling, so an inteval is not needed
app.get('/health', Middleware({
  copacetic,
  verbose: false
}))

app.listen(3000)
