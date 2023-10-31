// const mongoose = require('mongoose')

// if (process.argv.length < 3) {
// 	console.log('give password as argument')
// 	process.exit(1)
// }

// const password = process.argv[2]

// const url =
// 	`mongodb+srv://christopherkola:${password}@cluster0.ivfgiyv.mongodb.net/noteApp?retryWrites=true&w=majority`

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
// 	content: String,
// 	important: Boolean,
// })

// const Note = mongoose.model('Note', noteSchema)

// // const note = new Note({
// // 	content: 'HTML is Easy',
// // 	important: true,
// // })

// Note.find({}).then(result => {
// 	result.forEach(note => {
// 		console.log(note)
// 	})
// 	mongoose.connection.close()
// })

// // note.save().then(result => {
// // 	console.log('note saved!')
// // 	mongoose.connection.close()
// // })

const mongoose = require("mongoose");

if (process.argv.length < 3) {
	console.log('give password as argument')
	process.exit(1)
}

const password = process.argv[2];

const url =
	`mongodb+srv://christopherkola:${password}@cluster0.ivfgiyv.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
	id: Number,
	name: String,
	number: String,
});

const Person =  mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
	Person.find({}).then((persons) => {
		console.log(" phonebook: ")
		persons.forEach((person) => {
			console.log(`${person.name} ${person.number}`);
		})
		mongoose.connection.close()
	})
} else {
	const [, , password, name, number] = process.argv

	// Add a new entry to the phonebook
	const person = new Person({
		id: Math.floor(Math.random() * 10000),
		name,
		number,
	});

	person.save().then(() => {
		console.log(`Added ${name} number ${number} to phonebook`);
		mongoose.connection.close();
	});
}
