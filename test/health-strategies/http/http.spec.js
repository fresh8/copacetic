const expect = require('chai').expect
const nock = require('nock')

const CodependencyMock = require('../../mocks/codependency')
const Injector = require('../../../lib/util/injector')
const HttpStrategyFactory = require('../../../lib/health-strategies/http')

describe('HttpStrategy', () => {
  describe('when using node-fetch', () => {
    const HttpStrategy = HttpStrategyFactory(
      Injector(CodependencyMock({
        'node-fetch': require('node-fetch')
      }))
    )

    it('should export a function', () => {
      expect(HttpStrategyFactory).to.be.a('function')
    })

    it('should return a health strategy', () => {
      expect(HttpStrategy().check).to.be.a('function')
    })

    it('should return the response on success', () => {
      nock('http://example.com')
          .get('/')
          .reply(200)

      HttpStrategy()
        .check('http://example.com')
        .then((r) => {
          expect(r.status).to.equal(200)
        })
    })

    it('should return an error on failure', () => {
      nock('http://example.com')
          .get('/')
          .reply(400)

      HttpStrategy()
        .check('http://example.com')
        .catch((r) => {
          expect(r.status).to.equal(400)
        })
    })
  })
})
