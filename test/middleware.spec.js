const expect = require('chai').expect
const nock = require('nock')

describe('middleware', () => {
  const Copacetic = require('../')
  const Middleware = require('../').Middleware

  const nockIt = () => {
    nock('http://one-example.com')
      .get('/')
      .reply(200)
    nock('http://two-example.com')
      .get('/')
      .reply(400)
  }

  const res = { json: stuff => stuff, sendStatus: stuff => stuff }

  describe('when there is an interval', () => {
    it('it should poll a set of dependencies', () => {
      nockIt()

      const copacetic = Copacetic('test-service')
        .registerDependency({
          name: 'test-1',
          url: 'http://one-example.com'
        })
        .registerDependency({
          name: 'test-2',
          url: 'http://two-example.com'
        })

      const middleware = Middleware({
        copacetic,
        interval: '0.1 seconds',
        dependencies: [{ name: 'test-1' }]
      })

      copacetic.on('health', (info) => {
        expect(middleware(null, res)).to.deep.equal({
          name: 'test-service',
          healthy: true,
          dependencies: [
            {
              name: 'test-1',
              healthy: true,
              level: 'SOFT',
              lastChecked: info[0].lastChecked
            },
            {
              name: 'test-2',
              healthy: true,
              level: 'SOFT',
              lastChecked: undefined
            }
          ]
        })
      })

      copacetic.stop()
    })

    it('it should poll all dependencies', () => {
      nockIt()

      const copacetic = Copacetic('test-service')
        .registerDependency({
          name: 'test-1',
          url: 'http://one-example.com'
        })
        .registerDependency({
          name: 'test-2',
          url: 'http://two-example.com'
        })

      const middleware = Middleware({
        copacetic,
        interval: '0.1 seconds'
      })

      copacetic.on('health', (info) => {
        expect(middleware(null, res)).to.deep.equal({
          name: 'test-service',
          healthy: true,
          dependencies: [
            {
              name: 'test-1',
              healthy: true,
              level: 'SOFT',
              lastChecked: info[0].lastChecked
            },
            {
              name: 'test-2',
              healthy: false,
              level: 'SOFT',
              lastChecked: info[1].lastChecked
            }
          ]
        })
      })

      copacetic.stop()
    })

    it('should return a function', () => {
      expect(Middleware({ copacetic: Copacetic() })).to.be.a('function')
    })
  })

  describe('when there is no interval', () => {
    const copacetic = Copacetic('test-service')
      .registerDependency({
        name: 'test-1',
        url: 'http://one-example.com'
      })
      .registerDependency({
        name: 'test-2',
        url: 'http://two-example.com'
      })

    it('should return a function', () => {
      expect(Middleware({ copacetic })).to.be.a('function')

      expect(Middleware({ copacetic })(null, res)).to.deep.equal({
        name: 'test-service',
        healthy: true,
        dependencies: [
          {
            name: 'test-1',
            healthy: true,
            level: 'SOFT',
            lastChecked: undefined
          },
          {
            name: 'test-2',
            healthy: true,
            level: 'SOFT',
            lastChecked: undefined
          }
        ]
      })
    })
  })

  it('should return a status code', () => {
    const copacetic = Copacetic('test-service')
      .registerDependency({
        name: 'test-1',
        url: 'http://one-example.com'
      })
      .registerDependency({
        name: 'test-2',
        url: 'http://two-example.com'
      })

    expect(Middleware({ copacetic, verbose: false })(null, res)).to.deep.equal(200)
  })
})
