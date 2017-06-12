const Target = require('./target')

/**
 * An adapter for node-fetch
 * https://github.com/bitinn/node-fetch
 */
class NodeFetchAdapter extends Target {
  constructor (fetch) {
    super()
    this.fetch = fetch
  }

  request (url, options) {
    return this.fetch(url, options)
  }
}

module.exports = fetch => new NodeFetchAdapter(fetch)
