const expect = require('chai').expect
const nock = require('nock')


describe('Dependency', () => {
  let Dependency
  let dependency
  let DependencyFactory

  before(() => {
    DependencyFactory = require('../lib/dependency')
    const CodependencyMock = require('./mocks/codependency')
    const Injector = require('../lib/util/injector')

    Dependency = DependencyFactory(
      Injector(CodependencyMock({
        'node-fetch': require('node-fetch')
      }))
    )
  })

  beforeEach(() => {
    dependency = Dependency({ name: 'test-dependency', url: 'http://example.com' })
  })

  it('should export a function', () => {
    expect(Dependency).to.be.a('function')
  })

  describe('onHealthy()', () => {
    it('should mark a dependency as healthy', () => {
      dependency.onHealthy()

      expect(dependency.healthy).to.equal(true)
    })
  })

  describe('onUnhealthy()', () => {
    it('should mark a dependency as unhealthy', () => {
      dependency.onUnhealthy()

      expect(dependency.healthy).to.equal(false)
    })
  })

  describe('healthSummary', () => {
    it('should return health summary of the dependency', () => {
      dependency.onHealthy()

      expect({
        name: 'test-dependency',
        healthy: true,
        level: 'SOFT',
        lastChecked: dependency.lastChecked
      }).to.deep.equal(dependency.healthSummary)
    })
  })

  describe('check()', () => {
    it('should return a promise', () => {
      nock('http://example.com')
          .get('/')
          .reply(200)

      expect(dependency.check().then).to.be.a('function')
    })

    it('should return health info when healthy', () => {
      nock('http://example.com')
          .get('/')
          .reply(200)

      return dependency
        .check()
        .then((r) => {
          expect({
            name: 'test-dependency',
            healthy: true,
            level: 'SOFT',
            lastChecked: r.lastChecked
          }).to.deep.equal(r)
        })
    })

    it('should return health info when unhealthy', () => {
      nock('http://example.com')
          .get('/')
          .reply(404)

      return dependency
        .check(1, 500)
        .catch((r) => {
          expect({
            name: 'test-dependency',
            healthy: false,
            level: 'SOFT',
            lastChecked: r.lastChecked
          }).to.deep.equal(r)
        })
    })

    it('should check a dependency\'s health if retries > 1', () => {
      nock('http://example.com')
          .get('/')
          .reply(400)

      return dependency
        .check(2, 100)
        .catch((r) => {
          expect({
            name: 'test-dependency',
            healthy: false,
            level: 'SOFT',
            lastChecked: r.lastChecked
          }).to.deep.equal(r)
        })
    })

    describe('with a nominally non-throwing dependency', () => {
      const baseDependencyConfig = {
        name: 'token',
        url: 'kitty-kitty'
      }

      function makeDependency(dependencyConfig, strategy) {
        const Injector = require('../lib/util/injector')
        const mockedStrategyInjector = Injector((name) => strategy)
        DependencyFactory = require('../lib/dependency')
        dependencyConfig.strategy = {type: 'mockedStrategy'}
        return DependencyFactory(mockedStrategyInjector)(dependencyConfig)
      }

      it("reports healthy", () => {
        const dependency = makeDependency(baseDependencyConfig, {
          check() {
            return Promise.resolve({ iAm: 'fine' })
          },
          areYouOk(data) {
            return data.iAm === 'fine'
          }
        })
        return dependency
          .check()
          .then((r) => {
            expect(r.healthy).to.equal(true)
          })
      })

      it("reports unhealthy", () => {
        const dependency = makeDependency(baseDependencyConfig, {
          check() {
            return Promise.resolve({ iAm: 'not fine' })
          },
          areYouOk(data) {
            return data.iAm === 'fine'
          }
        })
        return dependency
          .check()
          .then((r) => {
            throw new Error('no pasaran')
          })
          .catch((r) => {
            expect(r.healthy).to.equal(false)
          })
      })
    })
  })
})
