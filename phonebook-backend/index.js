require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");



// Create Express applications for each port
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('dist'));


morgan.token("post-data", (request) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
  return "";
});

app.use(morgan("tiny", { stream: { write: (message) => console.log(message) } }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post-data")
);

// Route for /api/persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  })
});

// Route for /info
app.get("/api/info", async (request, response) => {
  try {
    const count = await Person.countDocuments({});
    const currentTime = new Date();
    const infoHTML = `
      <p>Phonebook has info for ${count} people</p>
      <p>${currentTime}</p>
    `;
    response.send(infoHTML);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Error fetching info" });
  }
});

//Route for /persons/5
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
});

//Route for deleting a single entry
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const { name, number } = body;
  if (!name || !number) {
    return response.status(400).json({ error: "Name and number are required" });
  }

  const person = new Person({
    name: name,
    number: number,
  });
  person.save()
    .then(savedPerson => {
      console.log("New person added:", savedPerson);
      response.json(savedPerson);
    })
    .catch(error => next(error))
});


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;
  const { name, number } = body;

  Person.findByIdAndUpdate(request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
    )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(500).send({ error: "malformatted id" });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error);
};

app.use(errorHandler)

// Start the Express servers for each port
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
