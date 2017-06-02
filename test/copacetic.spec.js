const expect = require('chai').expect
const nock = require('nock')

const Copacetic = require('../lib/copacetic')
const dependencyLevel = require('../lib/dependency-level')

describe('Copacetic', () => {
  it('should export a function', () => {
    expect(Copacetic).to.be.a('function')
  })

  describe('isCopaceticy', () => {
    it('should return true if a hard dependency is unhealthy', () => {
      const copacetic = new Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.HARD
      })

      nock('http://example.com')
          .get('/')
          .reply(400)

      copacetic
        .check({ name: 'My-Dependency' })
        .on('unhealthy', () => {
          expect(copacetic.isCopaceticy).to.equal(true)
        })
    })

    it('should return false if a soft dependency is unhealthy', () => {
      const copacetic = new Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.SOFT
      })

      nock('http://example.com')
          .get('/')
          .reply(400)

      copacetic
        .check({ name: 'My-Dependency' })
        .on('unhealthy', () => {
          expect(copacetic.hasHardDependencyFailure).to.equal(false)
        })
    })

    it('should return false if all dependencies are health', () => {
      const copacetic = new Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com',
        level: dependencyLevel.SOFT
      })

      nock('http://example.com')
          .get('/')
          .reply(200)

      copacetic
        .check({ name: 'My-Dependency' })
        .on('healthy', () => {
          expect(copacetic.hasHardDependencyFailure).to.equal(false)
        })
    })
  })

  describe('getCopaceticInfo', () => {
    const copacetic = new Copacetic()
    copacetic.registerDependency({
      name: 'My-Dependency',
      url: 'http://example.com'
    })

    it('should return the health info for all registered dependencies', () => {
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
    const copacetic = new Copacetic()
    copacetic.registerDependency({
      name: 'My-Dependency',
      url: 'http://example.com'
    })

    it('should look up a dependency given a dependency name', () => {
      expect(copacetic.getDependency('My-Dependency').name).to.equal('My-Dependency')
    })

    it('should look up a dependency given a dependency object', () => {
      expect(
        copacetic.getDependency(copacetic.getDependency('My-Dependency')).name
      ).to.equal('My-Dependency')
    })
  })

  describe('isDependencyRegistered', () => {
    const copacetic = new Copacetic()
    copacetic.registerDependency({
      name: 'My-Dependency',
      url: 'http://example.com'
    })

    it('should return true if a dependency exists', () => {
      expect(copacetic.isDependencyRegistered('My-Dependency')).to.equal(true)
    })

    it('should return false if a dependency does not exist', () => {
      expect(copacetic.isDependencyRegistered('Test-Dependency')).to.equal(false)
    })
  })

  describe('registerDependency()', () => {
    const copacetic = new Copacetic()

    it('should register a dependency if it does not exist', () => {
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
    const copacetic = new Copacetic()

    it('should deregister a dependency if it does exist', () => {
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      expect(copacetic.dependencyNames.indexOf('My-Dependency')).not.to.equal(-1)
      expect(() => copacetic.deregisterDependency('My-Dependency')).not.to.throw(Error)
      expect(copacetic.dependencyNames.indexOf('My-Dependency')).to.equal(-1)
    })

    it('should throw an error if the dependency does not exist', () => {
      expect(() => copacetic.deregisterDependency('My-Dependency')).to.throw(Error)
    })
  })

  describe('checkAll()', () => {
    it('should check the health of all registered dependencies', () => {
      const copacetic = new Copacetic()
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

      copacetic
        .checkAll()
        .on('healthy', (dependencyCopacetic) => {
          expect(dependencyCopacetic).to.deep.equal([
            {
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencyCopacetic.lastChecked
            },
            {
              name: 'My-Other-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencyCopacetic.lastChecked
            }
          ])
        })
    })
  })

  describe('check()', () => {
    describe('when checking one dependency', () => {
      const copacetic = new Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })

      it('should emit an "healthy" event when checking a single healthy dependency', () => {
        nock('http://example.com')
            .get('/')
            .reply(200)

        copacetic
          .check({ name: 'My-Dependency' })
          .on('healthy', (dependencyCopacetic) => {
            expect(dependencyCopacetic).to.deep.equal({
              name: 'My-Dependency',
              healthy: true,
              level: 'SOFT',
              lastChecked: dependencyCopacetic.lastChecked
            })
          })
      })
      it('should emit an "unhealthy" event when checking a single unhealthy dependency', () => {
        nock('http://example.com')
            .get('/')
            .reply(200)

        copacetic
          .check({ name: 'My-Dependency' })
          .on('unhealthy', (dependencyCopacetic) => {
            expect(dependencyCopacetic).to.deep.equal({
              name: 'My-Dependency',
              healthy: false,
              level: 'SOFT',
              lastChecked: dependencyCopacetic.lastChecked
            })
          })
      })
    })

    describe('when checking multiple dependencies', () => {
      const copacetic = new Copacetic()
      copacetic.registerDependency({
        name: 'My-Dependency',
        url: 'http://example.com'
      })
      copacetic.registerDependency({
        name: 'My-Other-Dependency',
        url: 'http://dankdependency.com'
      })

      it('should emit a "health" event when checking dependencies', () => {
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

  describe('poll()', () => {
    it('should emit a "health" event, describing the status of dependencies', () => {
      const copacetic = new Copacetic()
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

      setTimeout(() => copacetic.stop(), 100)
    })
  })

  describe('stop()', () => {
    it('should stop polling dependencies', () => {
      const copacetic = new Copacetic()
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
