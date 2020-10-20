'use strict'

const metrics = [
  {
    type: 'temperature',
    value: '30',
    createdAt: new Date(),
    uuid: 'yyy-yyy-yyy'
  },
  {
    type: 'wind',
    value: '13',
    createdAt: new Date(),
    uuid: 'yyy-yyy-yyy'
  },
  {
    type: 'uv_index',
    value: '0',
    createdAt: new Date(),
    uuid: 'yyy-yyy-yyw'
  },
  {
    type: 'humidity',
    value: '87',
    createdAt: new Date(),
    uuid: 'yyy-yyy-yyz'
  },
  {
    type: 'humidity',
    value: '90',
    createdAt: new Date(),
    uuid: 'yyy-yyy-yyy'
  }
]

module.exports = {
  all: metrics,
  byAgentUuid: uuid => metrics.filter(m => m.uuid === uuid),
  byTypeUuid: (type, uuid) => metrics.filter(m => m.type === type).filter(m => m.uuid === uuid)
}
