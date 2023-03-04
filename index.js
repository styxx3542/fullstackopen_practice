const express = require("express");
const cors = require('cors');
const Note = require('./models/note')
require('dotenv').config()
const app = express();
app.use(express.json());
app.use(express.static('build'))
app.use(cors())

app.get("/", (request, response) => {
    response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get("/api/notes/:id", (request, response) => {
    Note.findById(request.params.id).then(note => {
        response.json(note);
    })
});
app.delete("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter((note) => note.id !== id);
    response.status(204).end();
});
app.post("/api/notes", (req, re) => {
    const body = req.body;
    if(!body.content){
        return re.status(400).json({
            error: "content missing"
        })
    }
    const note = new Note({
        content:body.content,
        important:body.important || false,
    })
    note.save().then(savedNote => {
        re.json(savedNote)
    })
});
