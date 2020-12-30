'use strict'

const express = require('express')
const axios = require('axios')

const api = express.Router()

const { endpoint, apiToken } = require('./config')

api.get('/agents', async (req, res, next) => {
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

  res.send(result)
})
api.get('/agent/:uuid', (req, res) => {})
api.get('/metrics/:uuid', (req, res) => {})
api.get('/metrics/:uuid/:type', (req, res) => {})

module.exports = api
