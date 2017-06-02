const expect = require('chai').expect

const healthFactory = require('../../lib/health-strategies').healthFactory

describe('healthFactory', () => {
  it('should export a function', () => {
    expect(healthFactory).to.be.a('function')
  })

  it('should return a health strategy', () => {
    expect(healthFactory('http')).to.be.a('object')
    expect(healthFactory('mongodb')).to.be.a('object')
  })
})
