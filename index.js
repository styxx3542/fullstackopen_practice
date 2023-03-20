const express = require("express");
const app = express();

const cors = require('cors');
require('dotenv').config()

const Note = require('./models/note')

const requestLogger = (req,re,next) => {
    console.log('Method: ',req.method)
    console.log('Path: ',req.path)
    console.log('Body: ',req.body)
    console.log('---')
    next()
}

const errorHandler = (err,req,res,next) => {
    console.error(err)
    if (err.name === 'CastError'){
        return res.status(400).send({error : 'malformatted id'})
    }
    else if (err.name === 'ValidationError'){
        return res.status(400).json({ error: err.message })
    }
    next(err)
}

const unknownEndpoint = (req,res) => {
    res.status(404).send({error: 'unknown endpoint'})
}

app.use(cors())
app.use(express.json());
app.use(requestLogger)
app.use(express.static('build'))

app.get("/api/notes", (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
});


app.get("/api/notes/:id", (request, response) => {
    Note.findById(request.params.id).then(note => {
        if (note)
        {
            response.json(note);
        }
        else {
            response.status(404).end()
        }
        
    })
    .catch(err => next(err))
    })

app.delete("/api/notes/:id", (request, response) => {
    Note.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(404).end()
    })
    .catch(error => next(error))
});
app.post("/api/notes", (req, re,next) => {
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
    .catch(err => next(err))
});

app.put('/api/notes/:id',(req,res,next) => {
    const body = req.body;
    const note = {
        content: body.content,
        important: body.important,
    }
    Note.findByIdAndUpdate(req.params.id,note,{new:true, runValidators: true, context: 'query'})
    .then(updatedNote => {
        res.json(updatedNote)
    })
    .catch(error => next(error))
})
app.use(unknownEndpoint)


app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});