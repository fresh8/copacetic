const expect = require('chai').expect
const noop = require('node-noop').noop

const MongodbTarget = require('../../../../lib/health-strategies/mongodb/adapters/target')

describe('http target', () => {
  const target = new MongodbTarget()

  it('should be have a close method', () => {
    expect(target.close).to.be.a('function')
  })

  it('should be have a connect method', () => {
    expect(target.connect).to.be.a('function')
  })

  it('should be have a ping method', () => {
    expect(target.ping).to.be.a('function')
  })

  it('should return the connection status', () => {
    target.connection = null
    expect(target.isConnected).to.equal(false)

    target.connection = { close: noop }
    expect(target.isConnected).to.equal(true)
  })

  it('should close the connection', () => {
    target.connection = { close: noop }

    target.close()
    expect(target.isConnected).to.equal(false)

    target.close()
    expect(target.isConnected).to.equal(false)
  })
})
