'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('..')
const http = require('http')
const sget = require('simple-get').concat

test('Should support a custom http server', t => {
  t.plan(7)

  const serverFactory = (handler, opts) => {
    t.ok(opts.serverFactory)

    const server = http.createServer((req, res) => {
      req.custom = true
      handler(req, res)
    })

    return server
  }

  const fastify = Fastify({ serverFactory })

  t.teardown(fastify.close.bind(fastify))

  fastify.get('/', (req, reply) => {
    t.ok(req.raw.custom)
    t.equal(req.protocol, 'http:', 'protocol is http')
    reply.send({ hello: 'world' })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.deepEqual(JSON.parse(body), { hello: 'world' })
    })
  })
})
