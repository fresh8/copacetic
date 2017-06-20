const expect = require('chai').expect

describe('Injector', () => {
  const CodependencyMock = require('../mocks/codependency')
  const Injector = require('../../lib/util').Injector

  const injector = Injector(CodependencyMock({
    'ioredis': () => 'ioredis',
    'redis': () => 'redis'
  }))

  it('should return an injector', () => {
    expect(injector.provideAny).to.be.a('function')
    expect(injector.provideOne).to.be.a('function')
  })

  describe('provideAny()', () => {
    it('should provide the first dependency available', () => {
      const resolved = injector.provideAny(['ioredis', 'redis'])

      expect(resolved.exported()).to.equal('ioredis')
    })

    it('should throw an error if a non-optional dependency cannot be resolved', () => {
      expect(() => injector.provideAny(['aerospike'], false)).to.throw()
    })

    it('should fail gracefully if an optional dependency cannot be resolved', () => {
      expect(() => injector.provideAny(['mongodb'], true)).not.to.throw()
    })
  })

  describe('provideOne', () => {
    it('should resolve a dependency', () => {
      const resolved = injector.provideOne('redis')

      expect(resolved()).to.equal('redis')
    })

    it('should throw an error if a non-optional dependency cannot be resolved', () => {
      expect(() => injector.provideOne('aerospike')).to.throw()
    })

    it('should fail gracefully if an optional dependency cannot be resolved', () => {
      expect(() => injector.provideOne('mongodb', true)).not.to.throw()
    })
  })
})
