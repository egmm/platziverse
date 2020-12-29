'use strict'

const test = require('ava')
const util = require('util')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const auth = require('../auth')
const sign = util.promisify(auth.sign)

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')
const config = require('../config')

let sandbox = null
let server = null
let dbStub = null
let token = null

const uuid = 'yyy-yyy-yyy'
const type = 'humidity'
const AgentStub = {}
const MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.returns(Promise.resolve(metricFixtures.byTypeUuid(type, uuid)))

  token = await sign({ admin: true, username: 'platzi', permissions: ['metrics:read'] }, config.auth.secret)

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  })
  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(async () => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents - not authorized', t => {
  sign({}, config.auth.secret).then(unauthorizedToken => {
    request(server)
      .get('/api/agents')
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401)
      .end((err) => {
        t.falsy(err, 'should not return an error')
        t.end()
      })
  })
})
test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
test.serial.cb('/api/agent/:uuid - not found', t => {
  const badUuid = 'xxxxxx'
  AgentStub.findByUuid.returns(Promise.resolve(agentFixtures.byUuid(badUuid)))
  request(server)
    .get(`/api/agent/${badUuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricFixtures.byAgentUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid - not found', t => {
  const badUuid = 'xxxxxx'
  MetricStub.findByAgentUuid.returns(Promise.resolve(metricFixtures.byAgentUuid(badUuid)))
  request(server)
    .get(`/api/metrics/${badUuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      const body = JSON.stringify(res.body)
      const expected = JSON.stringify(metricFixtures.byTypeUuid(type, uuid))
      t.deepEqual(body, expected, 'response should be the expected')
      t.end()
    })
})

// TODO: check the correct response errors are being shown after creating the custom errors
test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  const badType = 'themetric'
  MetricStub.findByTypeAgentUuid.returns(Promise.resolve(metricFixtures.byTypeUuid(badType, uuid)))
  request(server)
    .get(`/api/metrics/${uuid}/${badType}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      t.end()
    })
})
