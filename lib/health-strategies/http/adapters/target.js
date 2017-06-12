/**
 * @class
 * @classdesc http adapters are expected to adhere to the interface
 * defined here
 */
class HttpTarget {
  /**
   * @param {String} url - a string representing the URL for fetching
   * @param {Object} options - options for the HTTP(s) request
   * @return {Promise<Response>}
   */
  request (url, options) {}

  /**
   * @param {Response} res
   * @return {Boolean}
   */
  success (res) {
    return res.status >= 200 && res.status < 300
  }

  /**
   * @param {Response} res
   * @return {Boolean}
   */
  redirection (res) {
    return res.status >= 300 && res.status < 400
  }

  /**
   * @param {Response} res
   * @return {Boolean}
   */
  clientErr (res) {
    return res.status >= 400 && res.status < 500
  }
}

module.exports = HttpTarget
