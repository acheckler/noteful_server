const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const NotesService = require('./notes-service')
const path = require('path');

const notesRouter = express.Router()
const jsonParser = express.json()


notesRouter
.route("/")
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then((notes) => {
        if (notes.length !== 0) {
          notes = notes.map(note => {
            return {
              id: note.id,
              note_name: xss(note.note_name), 
              folder_id: note.folder_id,
              content: xss(note.content), 
              modified: note.modified_date,
            }  
          })
        }
        return notes
      })
      .then(notes => res.status(200).json(notes))
      .catch(next)
  })
  .post((req, res, next) => {
    const { note_name, folder_id, content } = req.body;
    let newNote = { 
      note_name, folder_id  
    }

    for (const [key, value] of Object.entries(newNote)) {
      if(value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        })
      }
    }

    newNote = { 
      note_name: xss(note_name),
      folder_id,
      content: xss(content)  
    };

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(note)
      })
      .catch(next)
  });


  notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance, req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note 
        next() 
      })
      .catch(next)
  })
  .get((req, res, next) => {    
    res.json((res.note))      
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter