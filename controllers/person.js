const personRouter = require('express').Router()
const Person = require('../models/person')

personRouter.get('/info', (_, res) => {
  const received = new Date().toLocaleString()
  const count = Person.find({}).length

  const output = `
    <div>
      <p>Phonebook has info for ${count} people</p>
      <p>${received}</p>
    </div> 
  `
  res.send(output)
})

personRouter.get(`/`, (_, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

personRouter.get(`/:id`, (req, res, next) => {
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

personRouter.post('/', (req, res, next) => {
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

personRouter.put(`/:id`, (req, res, next) => {
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

personRouter.delete('/:id', (req, res, next) => {
  const id = String(req.params.id)
  Person.findByIdAndDelete(id).then(() => {
    res.status(204).end()
  })
    .catch(error => next(error))
})

module.exports = personRouter
