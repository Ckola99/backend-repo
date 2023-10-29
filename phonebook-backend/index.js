const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const PORT = process.env.PORT || 3001;


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

// Hardcoded phonebook entries
let phonebook = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
  { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' },
  { id: 5, name: 'Dave Jansen', number: '44-15-7548669'}
];

// Route for /api/persons
app.get("/api/persons", (request, response) => {
  response.json(phonebook);
});

// Route for /info
app.get("/info", (request, response) => {
  const currentTime = new Date();
  const entryCount = phonebook.length;

  const infoHTML = `
    <p>Phonebook has info for ${entryCount} people</p>
    <p>${currentTime}</p>
  `;

  response.send(infoHTML);
});

//Route for /persons/5
app.get("/api/persons/:id", (request, response) => {

  const id = parseInt(request.params.id);
  const person = phonebook.find(entry => entry.id === id);

  if (!person) {
    return response.status(404).json({error: "Person not found"});
  }

  response.json(person);
});

//Route for deleting a single entry
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const entryToDelete = phonebook.find((entry) => entry.id === id);

  if (!entryToDelete) {
    // If the entry with the specified ID is not found, respond with a 404 status and an error message.
    return response.status(404).json({ error: "Person not found" });
  }

  phonebook = phonebook.filter((entry) => entry.id !== id);

  response.send(phonebook)
  response.status(204).end()
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.number || !body.name) {
    return response.status(400).json({ error: "Name and number are required" });
  };

  // Check if 'name' already exists in the phonebook
  const nameExists = phonebook.some((entry) => entry.name === body.name);
  if (nameExists) {
    return response.status(400).json({ error: "Name must be unique" });
  }

  const newEntry = {
    id: Math.floor(Math.random() * 10000), // Generate a new random ID
    name: body.name,
    number: body.number,
  };

  phonebook.push(newEntry);

  console.log(newEntry);
  response.json(newEntry);
});

// Start the Express servers for each port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
