const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')
const { makeNotesArray } = require('./notes.fixtures')

describe('Noteful Endpoints', function () {
    let db;

    before('Make knex instance', () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL,
        })
        app.set("db", db)
    })

    before("clean the table", () => {
        return db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE');
      });
    
      after("disconnect from db", () => db.destroy());
    
      afterEach("cleanup", () => {
        return db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE');
      });

    describe(`GET /api/folders`, () => {
        context('Given no folders', () => {
            it('responds with an empty array', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })
        context('Given there are folders in the table', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('folders')
                    .insert(testFolders)
            })
            it('responds with all folders', () => {
                return supertest(app)
                .get('/api/folders')
                .expect(200, testFolders)
            })
        })
    })
    describe("POST /api/folders", () => {
        it("creates an folder, responds with 201 and the new folder", function() {
          this.retries(3);
          const newFolder = {
            folder_name: "Listicle",
          };
          return supertest(app)
            .post("/api/folders")
            .send(newFolder)
            .expect(201)
            .expect((res) => {
              expect(res.body.folder_name).to.eql(newFolder.folder_name);
              expect(res.body).to.have.property("id");
              expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
            })
            .then((postRes) =>
              supertest(app)
                .get(`/api/folders/${postRes.body.id}`)
                .expect(postRes.body)
            );
        });
    
        it(`responds with 400 and an error message when folder_name field is missing`, () => {
          const newFolder = {};
          return supertest(app)
            .post('/api/folders')
            .send(newFolder)
            .expect(400, {
              error: {message: `Missing folder name in request body`}
            });
        });
      });
    
})