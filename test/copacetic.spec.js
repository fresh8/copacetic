describe('Copacetic', () => {
  const expect = require('chai').expect
  const sinon = require('sinon')
  const nock = require('nock')
  const noop = require('node-noop').noop

  let Copacetic
  let dependencyLevel

  before(() => {
    const Dependency = require('../lib/dependency')
    const Injector = require('../lib/util/injector')
    const CodependencyMock = require('./mocks/codependency')

    dependencyLevel = require('../lib/dependency-level')
    Copacetic = require('../lib/copacetic')(
      Dependency(Injector(CodependencyMock({
        'node-fetch': require('node-fetch')
      })))
    )
  })

  it('should export a function', () => {
    expect(Copacetic).to.be.a('function')
  })

  it('should return an instance of Copacetic', () => {
    expect(Copacetic()).to.be.a('object')
  })

  it('should be in event emitter mode by default', () => {
    expect(Copacetic().eventEmitterMode).to.equal(true)
  })

  describe('isCopacetic', () => {
    it('should return false if a hard dependency is unhealthy', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.HARD
      })

      nock('http://example.com')
          .get('/')
          .reply(400)

      return copacetic
        .check({ name: 'My-Dependency' })
        .on('unhealthy', (healthInfo) => {
          expect(copacetic.isHealthy).to.equal(false)
        })
    })

    it('should return true if a soft dependency is unhealthy', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.SOFT
      })

      nock('http://example.com')
          .get('/')
          .reply(400)

      return copacetic
        .check({ name: 'My-Dependency' })
        .on('unhealthy', () => {
          expect(copacetic.isHealthy).to.equal(true)
        })
    })

    it('should return false if all dependencies are health', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.SOFT
      })

      nock('http://example.com')
          .get('/')
          .reply(200)

      return copacetic
        .check({ name: 'My-Dependency' })
        .on('healthy', () => {
          expect(copacetic.isHealthy).to.equal(false)
        })
    })
  })

  describe('getCopaceticInfo', () => {
    it('should return the health info for all registered dependencies', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.healthInfo).to.deep.equal(
        [
          {
            name: 'My-Dependency',
            healthy: true,
            level: 'SOFT',
            lastChecked: undefined
          }
        ]
      )
    })
  })

  describe('getDependency()', () => {
    let copacetic

    it('should look up a dependency given a dependency name', () => {
      copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.getDependency('My-Dependency').name).to.equal('My-Dependency')
    })

    it('should look up a dependency given a dependency object', () => {
      expect(
        copacetic.getDependency(copacetic.getDependency('My-Dependency')).name
      ).to.equal('My-Dependency')
    })
  })

  describe('isDependencyRegistered', () => {
    let copacetic

    it('should return true if a dependency exists', () => {
      copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.isDependencyRegistered('My-Dependency')).to.equal(true)
    })

    it('should return false if a dependency does not exist', () => {
      expect(copacetic.isDependencyRegistered('Test-Dependency')).to.equal(false)
    })
  })

  describe('registerDependency()', () => {
    let copacetic

    it('should register a dependency if it does not exist', () => {
      copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.getDependency('My-Dependency').name).to.equal('My-Dependency')
    })

    it('should throw an error if a dependency exists', () => {
      expect(() => copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })).to.throw(Error)
    })
  })

  describe('deregister()', () => {
    let copacetic

    it('should deregister a dependency if it does exist', () => {
      copacetic = Copacetic()

      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.dependencyNames.indexOf('My-Dependency')).not.to.equal(-1)
      expect(() => copacetic.deregisterDependency('My-Dependency')).not.to.throw(Error)
      expect(copacetic.dependencyNames.indexOf('My-Dependency')).to.equal(-1)
    })

    it('should throw an error if the dependency does not exist', () => {
      expect(() => copacetic.deregisterDependency('My-Dependencyyy')).to.throw(Error)
    })
  })

  describe('checkAll()', () => {
    let copacetic

    beforeEach(() => {
      copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })
      copacetic.registerDependency({
        name: 'My-Other-Dependency',
        url: 'http://other-example.com'
      })

      nock('http://example.com')
          .get('/')
          .reply(200)
      nock('http://other-example.com')
          .get('/')
          .reply(200)
    })

    it('should check the health of all registered dependencies', () => {
      return copacetic
        .checkAll()
        .on('healthy', (dependencies) => {
          expect(dependencies).to.deep.equal([
            {
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencies[0].lastChecked
            },
            {
              name: 'My-Other-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencies[1].lastChecked
            }
          ])
        })
    })

    it('should return a promise when not in eventEmitterMode', () => {
      copacetic.eventEmitterMode = false
      return copacetic
        .checkAll()
        .then((dependencies) => {
          expect(dependencies).to.deep.equal([
            {
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencies[0].lastChecked
            },
            {
              name: 'My-Other-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencies[1].lastChecked
            }
          ])
        })
    })
  })

  describe('check()', () => {
    describe('when checking one dependency', () => {
      let copacetic

      it('should emit an "healthy" event when checking a single healthy dependency', () => {
        copacetic = Copacetic()
        copacetic.registerDependency({
          name: 'My-Dependency',
          url: 'http://example.com'
        })

        nock('http://example.com')
            .get('/')
            .reply(200)

        copacetic
          .check({ name: 'My-Dependency' })
          .on('healthy', (dependency) => {
            expect(dependency).to.deep.equal({
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependency.lastChecked
            })
          })
      })
      it('should emit an "unhealthy" event when checking a single unhealthy dependency', () => {
        nock('http://example.com')
            .get('/')
            .reply(200)

        copacetic
          .check({ name: 'My-Dependency' })
          .on('unhealthy', (dependency) => {
            expect(dependency).to.deep.equal({
              name: 'My-Dependency',
              healthy: false,
              level: 'SOFT',
              lastChecked: dependency.lastChecked
            })
          })
      })

      it('should return a promise when not in eventEmitterMode', () => {
        nock('http://example.com')
            .get('/')
            .reply(200)

        copacetic.eventEmitterMode = false

        return copacetic
          .check({ name: 'My-Dependency' })
          .then((dependency) => {
            expect(dependency).to.deep.equal({
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependency.lastChecked
            })
          })
      })
    })

    describe('when checking multiple dependencies', () => {
      it('should emit a "health" event when checking dependencies', () => {
        let copacetic = Copacetic()
        copacetic.registerDependency({
          name: 'My-Dependency',
          url: 'http://example.com'
        })
        .registerDependency({
          name: 'My-Other-Dependency',
          url: 'http://dankdependency.com'
        })

        nock('http://example.com')
            .get('/')
            .reply(200)
        nock('http://dankdependency.com')
            .get('/')
            .reply(400)

        copacetic
          .check({
            dependencies: [
              { name: 'My-Dependency' },
              { name: 'My-Other-Dependency' }
            ],
            parallel: false
          })
          .on('health', (healthSummary) => {
            expect(healthSummary).to.deep.equal([
              {
                name: 'My-Dependency',
                healthy: true,
                level: 'SOFT',
                lastChecked: healthSummary[0].lastChecked
              },
              {
                name: 'My-Other-Dependency',
                healthy: false,
                level: 'SOFT',
                lastChecked: healthSummary[1].lastChecked
              }
            ])
          })
      })
    })
  })

  describe('waitFor', () => {
    it('should call check with unlimited retries', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      const checkSpy = sinon.stub(copacetic, 'check').callsFake(noop)

      copacetic.waitFor({ name: 'My-Dependency' })
      copacetic.waitFor({
        dependencies: [ { name: 'My-Dependency' } ]
      })

      expect(checkSpy.getCall(0).args[0]).to.deep.equal({
        name: 'My-Dependency', retries: 0
      })

      expect(checkSpy.getCall(1).args[0]).to.deep.equal({
        dependencies: [ { name: 'My-Dependency', retries: 0, maxDelay: 0 } ]
      })
    })
  })

  describe('poll()', () => {
    it('should emit a "health" event, describing the status of dependencies', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })
      copacetic.registerDependency({
        name: 'My-Other-Dependency',
        url: 'http://dankdependency.com'
      })

      nock('http://example.com')
          .get('/')
          .reply(200)
      nock('http://dankdependency.com')
          .get('/')
          .reply(400)

      copacetic
        .poll({
          dependencies: [
            { name: 'My-Dependency' },
            { name: 'My-Other-Dependency' }
          ]
        })
        .on('health', (healthSummary, stop) => {
          expect(healthSummary).to.deep.equal([
            {
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: healthSummary[0].lastChecked
            },
            {
              name: 'My-Other-Dependency',
              healthy: false,
              level: 'SOFT',
              lastChecked: healthSummary[1].lastChecked
            }
          ])

          stop()
        })
    })

    it('should poll a single dependency', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })
      nock('http://example.com')
          .get('/')
          .reply(200)

      return copacetic
        .poll({ name: 'My-Dependency' })
        .on('health', (healthSummary, stop) => {
          expect(healthSummary).to.deep.equal({
            name: 'My-Dependency',
            healthy: true,
            level: 'SOFT',
            lastChecked: healthSummary.lastChecked
          })

          stop()
        })
    })
  })

  describe('stop()', () => {
    it('should stop polling dependencies', () => {
      const copacetic = Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      nock('http://example.com')
          .get('/')
          .reply(200)

      copacetic.pollAll()
      expect(copacetic.isPolling).to.equal(true)
      copacetic.stop()
      expect(copacetic.isPolling).to.equal(false)
    })
  })
})
