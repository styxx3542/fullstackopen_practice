const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Note = require("../models/note");
const api = supertest(app);
const bcrypt = require("bcrypt");
const User = require("../models/user");

beforeEach(async () => {
    await Note.deleteMany({});
    const noteObjects = helper.initialNotes.map((note) => new Note(note));
    Promise.all(noteObjects.map((note) => note.save()));
});
test("notes are returned as json", async () => {
    await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
});

test("all notes are returned", async () => {
    const response = await api.get("/api/notes");
    expect(response.body).toHaveLength(helper.initialNotes.length);
});

test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");
    const contents = response.body.map((r) => r.content);
    expect(contents).toContain("Browser can execute only JavaScript");
});

test("a valid note can be added", async () => {
    const newNote = {
        content: "async/await simplifies making async calls",
        important: true,
    };

    await api
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const finalNotes = await helper.notesInDb();

    expect(finalNotes).toHaveLength(helper.initialNotes.length + 1);
    const contents = finalNotes.map((note) => note.content);
    expect(contents).toContain("async/await simplifies making async calls");
});

test("a note without content can't be added", async () => {
    const newNote = {
        important: true,
    };

    await api.post("/api/notes").send(newNote).expect(400);
    const finalNotes = await helper.notesInDb();
    expect(finalNotes).toHaveLength(helper.initialNotes.length);
});

test("a specific note can be viewed", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToView = notesAtStart[0];
    const note = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

    expect(note.body).toEqual(noteToView);
});

test("a note can be deleted", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);
    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);
    const contents = notesAtEnd.map((r) => r.content);
    expect(contents).not.toContain(noteToDelete.content);
});

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({});
        const passwordHash = await bcrypt.hash("sekret", 10);
        user = new User({ username: "root", passwordHash });
        await user.save();
    });

    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb();
        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map((u) => u.username);
        expect(usernames).toContain(newUser.username);
    });
    test("invalid users can't be created", async () => {
        const usersAtStart = await helper.usersInDb();
    });
    test("creation fails with proper status if username taken", async () => {
        const usersAtStart = await helper.usersInDb();
        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        };

        const result = await api
            .post("./api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("expected `username` to be unique");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });
});
afterAll(async () => {
    await mongoose.connection.close();
});
