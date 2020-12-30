'use strict'

const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBsYXR6aSIsImFkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwiaWF0IjoxNjA5MzQwMjY3fQ.GpaCVsEjRx5_o4b6YYVmFQRHuYyk9i3ZYpptI0NeI50'

module.exports = {
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
  apiToken: process.env.API_TOKEN || defaultToken
}
