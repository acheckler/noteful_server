const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const FoldersService = require('./folders-service')
const path = require('path')

const foldersRouter = express.Router()
const jsonParser = express.json()

const sanitizeFolder = folder => ({
    id: folder.id,  
    folder_name: xss(folder.folder_name)  
  })

foldersRouter
.route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then((folders) => {
        if (folders.length !== 0) {
          folders = folders.map(folders => {
            return {
              id: folders.id,
              folder_name: xss(folders.folder_name),
            }  
          })
        }
        return folders
      })
      .then(folders => res.json(folders))
      .catch(next)
  })
.post(jsonParser, (req, res, next) => {
    const { folder_name } = req.body
    const newFolder = {folder_name}
    
    if(!folder_name) {
        return res.status(400).json({
          error: { message: `Missing folder name in request body` }
        })
      }
   
      FoldersService.insertFolder(
        req.app.get('db'),
        newFolder
      )
        .then((folder) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl + `/${folder.id}`))
            .json(folder)
        })
        .catch(next)
})


foldersRouter
.route('/:id')
.all((req, res, next) => {
  const knexInstance = req.app.get('db')
  FoldersService.getById(knexInstance, req.params.id)
    .then(folder => {
      if (!folder) {
        return res.status(404).json({
          error: { message: `Folder doesn't exist` }
        })
      }
      res.folder = folder
      next() 
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json({
      id: res.folder.id,
      folder_name: xss(res.folder.folder_name) // sanitize folder_name
    })
    .catch(next)
  })


module.exports = foldersRouter
    