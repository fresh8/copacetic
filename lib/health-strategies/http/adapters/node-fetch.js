const HttpAdapter = require('./adapter')

/**
 * An adapter for node-fetch
 * https://github.com/bitinn/node-fetch
 */
class NodeFetchAdapter extends HttpAdapter {
  constructor (fetch) {
    super()
    this.fetch = fetch
  }

  /**
   * @param {String} url - a string representing the URL for fetching
   * @param {Object} options - options for the HTTP(s) request
   * @return {Promise<Response>}
   */
  request (url, options) {
    return this.fetch(url, options)
  }
}

module.exports = fetch => new NodeFetchAdapter(fetch)
