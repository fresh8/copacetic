/**
 * @class
 * @classdesc methods shared by all http adapters
 */
class HttpAdapter {
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

module.exports = HttpAdapter
