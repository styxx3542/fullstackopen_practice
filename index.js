const express = require("express");
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(express.static('build'))
app.use(cors())

const generate_id = () => {
    if (!notes) maxId = 0;
    else maxId = Math.max(...notes.map((note) => note.id));
    return maxId + 1;
};
let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true,
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false,
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true,
    },
];

app.get("/", (request, response) => {
    response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
    response.json(notes);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    const note = notes.find((note) => note.id === id);
    if (note) response.json(note);
    else response.status(404).end();
    response.json(note);
});
app.delete("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter((note) => note.id !== id);
    console.log(notes);
    response.status(204).end();
});
app.post("/api/notes", (req, re) => {
    const body = req.body;
    if(!body){
        return response.status(400).json({
            error: "content missing"
        })
    }
    const note = {
        content: body.content,
        important: body.important||false,
        id:generate_id(),
        date: new Date()
    }
    notes = notes.concat(note);
    re.json(note);
});
