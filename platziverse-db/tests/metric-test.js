'use strict'
const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

const config = {
  loggin: function () { }
}

const uuid = 'yyy-yyy-yyy'
const queryUuid = agentModel => ({
  attributes: ['type'],
  group: ['type '],
  include: [{
    attributes: [],
    model: agentModel,
    where: {
      uuid
    }
  }],
  raw: true
})
const type = 'humidity'
const queryTypeUuid = agentModel => ({
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: agentModel,
    where: {
      uuid
    }
  }],
  raw: true
})
const agentQuery = {
  where: { uuid }
}
let sandbox = null
let AgentStub = null
let MetricStub = null
let db = null

const newMetric = {
  type: 'humidity',
  value: '90'
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }
  MetricStub = {
    belongsTo: sinon.spy()
  }

  // Model findAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(queryUuid(AgentStub)).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  MetricStub.findAll.withArgs(queryTypeUuid(AgentStub)).returns(Promise.resolve(metricFixtures.byTypeUuid(type, uuid)))

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(agentQuery).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model create Stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(Object.assign(newMetric, { agentId: agentFixtures.byUuid(uuid).id })).returns(Promise.resolve({ toJSON: () => newMetric }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#findByAgentUuid', async t => {
  const metric = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(queryUuid(AgentStub)), 'findAll should be called with specified query')

  t.deepEqual(metric, metricFixtures.byAgentUuid(uuid), 'should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  const metric = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(queryTypeUuid(AgentStub)), 'findAll should be called with specified query')

  t.deepEqual(metric, metricFixtures.byTypeUuid(type, uuid), 'should be the same')
})

test.serial('Metric#create', async t => {
  const metric = await db.Metric.create(uuid, newMetric)
  const returnedMetric = Object.assign(newMetric, { agentId: agentFixtures.byUuid(uuid).id })

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(returnedMetric), 'create should be called with specified query')

  // TODO: check why this always asserts true
  t.deepEqual(metric, returnedMetric, 'should be the same')
})
