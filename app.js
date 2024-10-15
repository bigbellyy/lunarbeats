const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const rateLimit = require('express-rate-limit')

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const uri = ""; //obscurated
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//Usage properties
const maxMemoryUsage = 150000;

//Set up static files
app.use(express.static("s"));

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 100,
    max: 100,
    message: "Too many API calls from this IP Address.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.post("/api/signUp", signUp);

app.post("/api/logIn", logIn);

app.post("/api/createSong", createSong);

app.post("/api/searchSongs", searchSongs);

app.post("/api/loadSongData", loadSongData);

app.post("/api/getAccountData", getAccountData);

app.put("/api/updateSong", updateSong);

app.delete("/api/deleteSong", deleteSong);

app.get("/api/getMostPlayedSongs", getMostPlayedSongs);

app.get("/api/getRecentSongs", getRecentSongs);

/*
Sends object : {mostRecentSongs}
*/
async function getRecentSongs(req, res) {
    try {
        const songs = client.db("game_storage").collection("songs");

        const mostRecentSongs = await songs.find().project({ songData: 0 }).sort({ date: -1 }).limit(15).toArray();

        res.send(JSON.stringify(mostRecentSongs));
    }
    catch (error) {
        res.send(JSON.stringify({
            message: error.message
        }));
    }
}

/*
Sends object : {mostPlayedSongs}
*/
async function getMostPlayedSongs(req, res) {
    try {
        const songs = client.db("game_storage").collection("songs");

        const mostPlayedSongs = await songs.find().project({ songData: 0 }).sort({ plays: -1 }).limit(15).toArray();

        res.send(JSON.stringify(mostPlayedSongs));
    }
    catch (error) {
        res.send(JSON.stringify({
            message: error.message
        }));
    }
}

/*
Accepts body : {userId}
Sends object : {strippedUserObject}
*/
async function getAccountData(req, res) {
    try {
        const userId = req.body.userId;

        const userObject = await getUserObject(userId);

        const strippedUserObject = stripUserObject(userObject);

        res.send(JSON.stringify(strippedUserObject));
    }
    catch (error) {
        res.send(JSON.stringify({
            message: error.message
        }));
    }
}

/*
Accepts body : {userId, songId, token}
Sends object : {strippedUserObject}
*/
async function deleteSong(req, res) {
    try {
        const userId = req.body.userId;
        const songId = req.body.songId;
        const token = req.body.token;

        const tokenIsValid = validateToken(token, songId);

        if (!tokenIsValid) {
            throw new Error("Invalid token.");
        }

        const songs = client.db("game_storage").collection("songs");

        const query = { songId: parseInt(songId) };

        const makerSongId = await songs.findOne(query);

        if (makerSongId.userId != userId) {
            throw new Error("Invalid user ID");
        }

        const usage = JSON.stringify(makerSongId).length;

        await songs.deleteOne(query);
        console.log(usage);
        const userQuery = { userId: parseInt(userId) }
        const newValue = {$inc : {memoryUsage : -usage}}
        
        await updateDocument("users", userQuery, newValue)

        res.send(JSON.stringify({
            songId: songId
        }))
    }
    catch (error) {
        res.send(JSON.stringify({
            message: error.message
        }));
    }
}

/*
Accepts body : {userId, songId, songData, token, maxScore, difficulty}
Sends object : {songId}
*/
async function updateSong(req, res) {
    try {
        const userId = req.body.userId;
        const songId = req.body.songId;
        let songData = req.body.songData;
        const token = req.body.token;
        const maxScore = req.body.maxScore;
        const difficulty = req.body.difficulty

        const tokenIsValid = validateToken(token, userId);

        if (!tokenIsValid) {
            throw new Error("Invalid token.");
        }

        const memoryUsage = await getMemoryUsage(userId);

        if (memoryUsage > maxMemoryUsage) {
            throw new Error("Too much memory usage.");
        }

        const songs = client.db("game_storage").collection("songs");

        const query = { songId: parseInt(songId) };

        const makerSongId = await songs.findOne(query);

        if (makerSongId.userId != userId) {
            throw new Error("Invalid user ID");
        }

        const originalSongUsage = JSON.stringify(makerSongId).length;

        const date = getDate();

        songData = validateSongData(songData);

        if (!songData) {
            throw new Error("Invalid song data.");
        }

        const newValues = { $set: { songData: songData, date: date, name: songData.name, artist: songData.artist, difficulty: difficulty, maxScore: maxScore } };

        await songs.updateOne(query, newValues);

        const newSongData = await songs.findOne(query);
        console.log(JSON.stringify(newSongData).length - originalSongUsage);
        await updateMemoryUsage(JSON.stringify(newSongData).length - originalSongUsage, userId);

        res.send(JSON.stringify({
            songId: songId
        }));
    }
    catch (error) {
        console.log(error);
        res.send(JSON.stringify({
            message: error.message
        }));
    }
}

/*
Accepts body : {songId}
Sends object : {songData}
*/
async function loadSongData(req, res) {
    try {
        const songId = req.body.songId;

        const song = await getSong(songId);

        if (!song) {
            throw "Invalid song ID";
        }

        res.send(JSON.stringify(song.songData));

        const query = { songId: parseInt(songId) };

        const newValues = {
            $inc: { plays: 1 }
        }

        updateDocument("songs", query, newValues);
    }
    catch (error) {
        res.send(JSON.stringify({
            error: error.message
        }));
    }
}

/*
Accepts body : {searchQuery}
Sends object : {songs}
*/
async function searchSongs(req, res) {
    try {
        const searchQuery = req.body.searchQuery;

        if (searchQuery.length > 50) {
            throw new Error("Search query too long.");
        }

        const query1 = { 'name': { '$regex': searchQuery, '$options': 'i' } };
        const query2 = { 'artist': { '$regex': searchQuery, '$options': 'i' } };
        const query3 = { 'username': { '$regex': searchQuery, '$options': 'i' } };
        const query4 = { 'difficulty': { '$regex': searchQuery, '$options': 'i' } };

        const query = { $or: [query1, query2, query3, query4] };

        const songs = await client.db("game_storage").collection("songs").find(query)
            .project({ notesData: 0 }).limit(15).toArray();

        res.send(JSON.stringify(songs));
    }
    catch (error) {
        res.send(JSON.stringify({
            error: error.message
        }));
    }
}

/*
Accepts body : {userId, token, songData, difficulty, maxScore}
Sends object : {songId}
*/
async function createSong(req, res) {
    try {
        const userId = req.body.userId;
        const token = req.body.token;
        const difficulty = req.body.difficulty;
        const maxScore = req.body.maxScore;
        let songData = req.body.songData;

        const tokenIsValid = await validateToken(token, userId);

        if (!tokenIsValid) {
            throw new Error("Invalid token");
        }

        const memoryUsage = await getMemoryUsage(userId);

        if (memoryUsage > maxMemoryUsage) {
            throw new Error("Too much memory usage.");
        }

        const songs = client.db("game_storage").collection("songs");

        const songId = await generateCounterId("6471911532e3ce9f4a229201", "songIdCount");

        const date = getDate();

        const userObject = await getUserObject(userId);

        const username = userObject.username;

        songData = validateSongData(songData);

        if (!songData) {
            throw new Error("Invalid song data.");
        }

        songData = {
            userId: userId,
            username: username,
            date: date,
            songData: songData,
            songId: songId,
            name: songData.name,
            artist: songData.artist,
            songURL: songData.songURL,
            plays: 0,
            difficulty: difficulty,
            maxScore: maxScore
        };

        await songs.insertOne(songData);

        const response = JSON.stringify({
            songId: songId
        });

        res.send(response);

        await updateMemoryUsage(JSON.stringify(songData).length, userId);
    }
    catch (error) {
        res.send(JSON.stringify({
            error: error.message
        }));
    }
}

/*
Accepts body : {username, password, ?token}
Sends object : {userId, username, token}
*/
async function logIn(req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const token = req.body.token;

        const users = client.db("game_storage").collection("users");

        //Check if username already exists
        const query = { username: username };
        const userObject = await users.findOne(query);

        //Check if token matches stored token
        if (token) {
            if (token == userObject.token) {
                res.send(JSON.stringify(stripUserObject(userObject)));
                return;
            }
            //If token doesn't match throw error
            throw new Error("Error : Invalid token.");
        }

        //Check if sent password matches stored password
        if (password == userObject.password) {
            //Generate new token
            const token = generateToken();

            userObject.token = token;

            const newValues = { $set: { token: token } };

            await users.updateOne(query, newValues);

            res.send(JSON.stringify(stripUserObject(userObject)));
            return;
        }
        //If password doesn't match throw error
        throw new Error("Error : Invalid password.");
    }
    catch (error) {
        res.send(JSON.stringify({
            error: error.message
        }))
    }
}

/*
Accepts body : {username, password}
Sends object : {userId, username, token}
*/
async function signUp(req, res) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const users = client.db("game_storage").collection("users");

        //Check if username already exists
        const query = { username: username };
        const duplicate = await users.findOne(query);

        //Check illegal usernames/passwords
        if (duplicate) {
            throw new Error("Username taken, please choose another one.");
        }
        else if (!isValid(username)) {
            throw new Error("Username must only contain letters and numbers.");
        }
        else if (username.length > 16) {
            throw new Error("Username length must be under 32 characters.");
        }
        else if (password.length > 50) {
            throw new Error("Password length must be under 100 characters.");
        }

        //Create user data
        const userId = await generateCounterId("6471911532e3ce9f4a229201", "userIdCount");
        const iPAddress = req.ip;
        console.log(userId);
        const token = generateToken();

        const userObject = {
            userId: userId,
            username: username,
            password: password,
            iPAddress: iPAddress,
            token: token,
            memoryUsage: 0
        }

        await users.insertOne(userObject);

        res.send(JSON.stringify(stripUserObject(userObject)));
    }
    catch (error) {
        res.send(JSON.stringify({
            error: error.message
        }));
    }
}

async function generateCounterId(id, key) {
    try {
        const counters = client.db("game_storage").collection("counters");

        id = new ObjectId(id);

        const updatedDocument = await counters.findOneAndUpdate(
            { _id: id },
            { $inc: { [key]: 1 } },
            { returnDocument: 'after' }
        );

        const newCount = updatedDocument.value[key];

        return newCount;
    }
    catch (error) {
        return error;
    }
}

async function updateMemoryUsage(usage, userId) {
    try {
        const users = client.db("game_storage").collection("users");

        const updatedUser = await users.findOneAndUpdate(
            { userId: parseInt(userId) },
            { $inc: { "memoryUsage": usage } },
            { returnDocument: 'after' }
        );

        return updatedUser.value.memoryUsage;
    }
    catch (error) {
        console.log(error)
        return error;
    }
}

async function getMemoryUsage(userId) {
    try {
        const user = await getUserObject(userId);

        const usage = user.memoryUsage;

        return usage;
    }
    catch (error) {
        return error;
    }
}

async function getSong(songId) {
    const songs = client.db("game_storage").collection("songs");

    const query = { songId: parseInt(songId) };

    const song = await songs.findOne(query);

    return song;
}

async function getUserObject(userId) {
    try {
        const users = client.db("game_storage").collection("users");

        const query = { userId: parseInt(userId) };

        const user = await users.findOne(query);

        return user;
    }
    catch (error) {
        return error;
    }
}

async function validateToken(token, userId) {
    try {
        const users = client.db("game_storage").collection("users");

        const query = { userId: parseInt(userId) };
        const userObject = await users.findOne(query);

        if (token == userObject.token) {
            return true;
        }

        return false;
    }
    catch {
        return false;
    }
}

async function updateDocument(collection, query, newValues) {
    try {
        await client.db("game_storage").collection(collection).updateOne(query, newValues);
    }
    catch {
        console.log("Error updating document");
    }
}

function isValid(str) { return /^\w+$/.test(str); }

function validateSongData(songData) {
    try {
        songData = JSON.stringify(songData);

        if (songData.length > 50000) {
            throw Error("Song data size overflow.");
        }

        songData = JSON.parse(songData);

        if (songData.name.length > 50 || songData.artist.length > 50) {
            throw Error("Title or artist name is too long.");
        }
    }
    catch (error) {
        songData = false;
    }
    finally {
        return songData;
    }
}

function stripUserObject(obj) {
    try {
        const newObj = {
            userId: obj.userId,
            username: obj.username,
            token: obj.token,
            memoryUsage: obj.memoryUsage
        }

        return newObj;
    }
    catch (error) {
        return error;
    }
}

function getDate() { //https://stackoverflow.com/a/29774197
    let yourDate = Date.now();

    return yourDate;
}

function generateToken() {
    let randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);

    return randomNumber;
}

app.listen(3000);