require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
var morgan = require('morgan')

const app = express()

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

const baseUrl = '/api/persons'

app.get('/info', (_, res) => {
  const received = new Date().toLocaleString()
  const count = Person.find({}).length

  const output = `
    <div>
      <p>Phonebook has info for ${count} people</p>
      <p>${received}</p>
    </div> 
  `
  console.log(output)
  res.send(output)
})

app.get(`${baseUrl}/`, (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get(`${baseUrl}/:id`, (req, res, next) => {
  const id = String(req.params.id)
  Person.findById(id).then(result => {
    if (result) {
      res.json(result)
    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error))

})

app.post(baseUrl, (req, res, next) => {
  const { name, number } = req.body

  // check if both name and number aren't empty
  if (!name || !number) {
    return res.status(400).json({
      error: 'invalid parameters. both name and number must be present'
    })
  }
  // save to db
  const person = new Person({
    name: name,
    number: number
  })
  person.save().then(result => {
    return res.json(result)
  }).catch(error => next(error))
})

app.put(`${baseUrl}/:id`, (req, res, next) => {
  const id = req.params.id
  const { name, number } = req.body

  Person.findById(id).then(result => {
    if (!result) {
      return res.status(404).end()
    }
    result.name = name || result.name
    result.number = number || result.number

    result.save().then(updated => {
      return res.json(updated)
    })
  })
    .catch(error => next(error))
})

app.delete(`${baseUrl}/:id`, (req, res, next) => {
  const id = String(req.params.id)
  Person.findByIdAndDelete(id).then(() => {
    res.status(204).end()
  })
    .catch(error => next(error))
})

const unkownEndpoint = (_, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unkownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
