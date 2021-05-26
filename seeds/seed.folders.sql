INSERT INTO folders (id, folder_name)
VALUES
(1, 'Important'),
(2, 'Super'),
(3, 'Spangley');

INSERT INTO notes (note_name, content, folder_id)
VALUES
( 'Dogs', 'Dogs content', 1 ),
( 'Cats', 'Cats content', 2 ),
( 'Pigs', 'Pigs content', 2 ),
( 'Tigers', 'Tigers content', 3 ),
( 'Wolves', 'Dogs content', 1 );