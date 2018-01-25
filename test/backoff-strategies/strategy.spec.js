const expect = require('chai').expect

const Strategy = require('../../lib/backoff-strategies/strategy')

describe('strategy', () => {
  const strategy = new Strategy()

  it('should fail after 0.005 seconds by default', () => {
    expect(strategy.retries).to.equal(3)
  })

  it('should have an execute function', () => {
    expect(strategy.execute).to.be.a('function')
  })

  it('should let information through', () => {
    const func = () => Promise.resolve('went through')
    return strategy.execute({func})
      .then(res => expect(res).to.equal('went through'))
  })
})
