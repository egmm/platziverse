'use strict'

const debug = require('debug')('platziverse:web:proxy')
const express = require('express')
const axios = require('axios')

const api = express.Router()

const { endpoint, apiToken } = require('./config')

api.get('/agents', async (req, res, next) => {
  debug('Request to /agents')
  const options = {
    method: 'get',
    url: `${endpoint}/api/agents`,
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  }
  let result
  try {
    result = await axios(options)
  } catch (error) {
    return next(error)
  }

  res.send(result.data)
})
api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`Request to /agent/${uuid}`)
  const options = {
    method: 'get',
    url: `${endpoint}/api/agent/${uuid}`,
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  }
  let result
  try {
    result = await axios(options)
  } catch (error) {
    return next(error)
  }

  res.send(result.data)
})
api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`Request to /metrics/${uuid}`)
  const options = {
    method: 'get',
    url: `${endpoint}/api/metrics/${uuid}`,
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  }
  let result
  try {
    result = await axios(options)
  } catch (error) {
    return next(error)
  }

  res.send(result.data)
})
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`Request to /metrics/${uuid}/${type}`)
  const options = {
    method: 'get',
    url: `${endpoint}/api/metrics/${uuid}/${type}`,
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  }
  let result
  try {
    result = await axios(options)
  } catch (error) {
    return next(error)
  }

  res.send(result.data)
})

module.exports = api
