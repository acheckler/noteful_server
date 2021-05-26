function makeNotesArray() {
    return [
      {
        id: 1,
        note_name: 'Dogs',
        content: 'Dogs Content',
        folder_id: 1
      },
      {
        id: 2,
        note_name: 'Cats',
        content: 'Cats Content',
        folder_id: 2
      },
      {
        id: 3,
        note_name: 'Pigs',
        content: 'Pigs Content',
        folder_id: 2
      },
      {
        id: 4,
        note_name: 'Tigers',
        content: 'Tigers Content',
        folder_id: 3
      }    
    ]
  }
  
  module.exports = { makeNotesArray }