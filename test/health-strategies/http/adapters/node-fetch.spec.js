const expect = require('chai').expect
const nock = require('nock')

describe('HttpStrategy - using the node-fetch adapter', () => {
  let HttpStrategy

  before(() => {
    const CodependencyMock = require('../../../mocks/codependency')
    const Injector = require('../../../../lib/util/injector')
    const HttpStrategyFactory = require('../../../../lib/health-strategies/http')
    HttpStrategy = HttpStrategyFactory(
      Injector(CodependencyMock({
        'node-fetch': require('node-fetch')
      }))
    )
  })

  it('should return a health strategy', () => {
    expect(HttpStrategy().check).to.be.a('function')
  })

  it('should return the response on success', () => {
    nock('http://example.com')
      .get('/')
      .reply(200)

    return HttpStrategy()
      .check('http://example.com')
      .then((r) => {
        expect(r.status).to.equal(200)
      })
  })

  it('should return an error on failure', () => {
    nock('http://example.com')
      .get('/')
      .reply(400)

    return HttpStrategy()
      .check('http://example.com')
      .catch((r) => {
        expect(r.status).to.equal(400)
      })
  })
})
