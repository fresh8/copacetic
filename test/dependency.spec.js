const { expect, assert } = require('chai')
const nock = require('nock')

describe('Dependency', () => {
  let Dependency
  let dependency
  let DependencyFactory

  function makeDependencyWithStrategy (dependencyConfig, strategy) {
    const Injector = require('../lib/util/injector')
    const mockedStrategyInjector = Injector((name) => strategy)
    DependencyFactory = require('../lib/dependency')
    dependencyConfig.strategy = {type: 'mockedStrategy'}
    return DependencyFactory(mockedStrategyInjector)(dependencyConfig)
  }

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

  it("should accept not having a url parameter", () => {
    const dependency = Dependency({ name: 'test-dependency'})
    assert.isUndefined(dependency.url)
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
    const baseDependencyConfig = {
      name: 'token',
      url: 'kitty-kitty'
    }

    it('should return health summary of the dependency', () => {
      dependency.onHealthy()

      expect({
        name: 'test-dependency',
        healthy: true,
        level: 'SOFT',
        lastChecked: dependency.lastChecked
      }).to.deep.equal(dependency.healthSummary)
    })

    it('Can improve the summary on healthy', () => {
      const dependency = makeDependencyWithStrategy(baseDependencyConfig, {
        check () {
          return Promise.resolve({ iAm: 'fine' })
        },
        improveSummary (summary, checkResult) {
          summary.whatDidISay = checkResult.iAm
        }
      })

      return dependency
        .check()
        .then(() => {
          const summary = dependency.healthSummary
          expect(summary.healthy).to.equal(true)
          assert.isDefined(summary.whatDidISay)
          expect(summary.whatDidISay).to.equal('fine')
        })
    })

    it('Can report on unhealthy if information is provided', () => {
      const dependency = makeDependencyWithStrategy(baseDependencyConfig, {
        check () {
          return Promise.resolve({ iAm: 'not fine' })
        },
        areYouOk (result) {
          return false // this dependency is never healthy
        },
        improveSummary (summary, checkResult) {
          summary.whatDidISay = checkResult.iAm
        }
      })

      return dependency
        .check() // will throw, cause unhealthy
        .catch(() => {
          const summary = dependency.healthSummary
          expect(summary.healthy).to.equal(false)
          assert.isDefined(summary.whatDidISay)
          expect(summary.whatDidISay).to.equal('not fine')
        })
    })

    it('Cleanes up past enhancement when in throw mode and unhealthly', () => {
      let howIFeel = 'fine'
      const dependency = makeDependencyWithStrategy(baseDependencyConfig, {
        check () {
          const iAmHealthy = howIFeel === 'fine'
          if (iAmHealthy) {
            return Promise.resolve({ iAm: howIFeel })
          }
          return Promise.reject(new Error('Argh'))
        },
        improveSummary (summary, checkResult) {
          if (checkResult) {
            summary.whatDidISay = checkResult.iAm
          }
        }
      })

      return dependency
        .check() // check once, healthy
        .then(() => {
          howIFeel = 'not fine'
          const summary = dependency.healthSummary
          expect(summary.healthy).to.equal(true)
          assert.isDefined(summary.whatDidISay)
          expect(summary.whatDidISay).to.equal('fine')
          return new Promise((resolve, reject) => {
            dependency.check() // check again, unhealthy
            .then(reject)
            .catch(() => {
              const summary = dependency.healthSummary
              expect(summary.healthy).to.equal(false)
              assert.isUndefined(summary.whatDidISay) // when in throwing mode, there is no way to provide health information to the summary
              resolve()
            })
          })
        })
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

      it('reports healthy', () => {
        const dependency = makeDependencyWithStrategy(baseDependencyConfig, {
          check () {
            return Promise.resolve({ iAm: 'fine' })
          },
          areYouOk (data) {
            return data.iAm === 'fine'
          }
        })
        return dependency
          .check()
          .then((r) => {
            expect(r.healthy).to.equal(true)
          })
      })

      it('reports unhealthy', () => {
        const dependency = makeDependencyWithStrategy(baseDependencyConfig, {
          check () {
            return Promise.resolve({ iAm: 'not fine' })
          },
          areYouOk (data) {
            return data.iAm === 'fine'
          }
        })
        return new Promise((resolve, reject) => {
          dependency
          .check()
          .then(reject)
          .catch((r) => {
            expect(r.healthy).to.equal(false)
            resolve()
          })
        })
      })
    })
  })
})
