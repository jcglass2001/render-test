const express = require("express")
const cors = require('cors')
var morgan = require("morgan")

const app = express()

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(express.json())
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
app.use(cors())

const baseUrl = '/api/persons'
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

app.get('/info', (_, res) => {
  const count = persons.length
  const received = new Date().toLocaleString()

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
  res.json(persons)
})

app.get(`${baseUrl}/:id`, (req, res) => {
  const id = String(req.params.id)
  const person = persons.find(p => p.id === id)

  console.log(person)

  if (!person) {
    return res.status(404).send('Entry not found')
  }
  res.json(person)
})

app.post(baseUrl, (req, res) => {
  const body = req.body
  const exists = persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())

  if (exists) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }
  if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }
  const entry = {
    id: Math.floor(Math.random() * 100),
    name: body.name,
    number: body.number || ""
  }

  persons = persons.concat(entry)
  res.json(entry)
})

app.delete(`${baseUrl}/:id`, (req, res) => {
  const id = String(req.params.id)
  const person = persons.find(p => p.id === id)

  if (!person) {
    return res.status(404).send('Entry not found')
  }
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const unkownEndpoint = (_, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unkownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
