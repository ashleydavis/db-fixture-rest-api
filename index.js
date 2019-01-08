"use strict";

const inProduction = process.env.NODE_ENV === "production";
if (inProduction) {
    throw new Error("Don't run DB FIXTURE API in production!!");
}

const express = require('express');
const Fixtures = require('node-mongodb-fixtures');
const path = require('path');
const{ MongoClient, ObjectId, ObjectID } = require('mongodb');

const app = express();

const fixturesDirectory = process.env.FIXTURES_DIR || "fixtures";
const port = process.env.PORT || 3555;
const databaseHost = process.env.DBHOST || "mongodb://localhost:27017";
const dbName = process.env.DBNAME || "my-test-database";
console.log("Using DBHOST " + databaseHost);
console.log("Using DB " + dbName);

//
// Connect to the database.
//
async function connectDatabase() {
    return await MongoClient.connect(databaseHost);
}

//
// Start the HTTP server.
//
function startServer() {
    return new Promise((resolve, reject) => {
        var server = app.listen(port, err => {
            if (err) {
                reject(err);
                return;
            }

            const addrInfo = server.address();
            const host = addrInfo.address;
            const port = addrInfo.port;
            console.log("DB fixture REST API listening at http://%s:%s", host, port);
            console.log("Please please your database fixtures in the 'fixtures' sub-directory.")
            console.log("Use the following endpoints to load and unload your database fixtures:");
            console.log(`HTTP GET http://localhost:${port}/load-fixture?name=your-fixture-name`);
            console.log(`HTTP GET http://localhost:${port}/unload-fixture?name=your-fixture-name`);

            resolve(server);
        });
    });
}

//
// Load a fixture to the database.
//
async function loadFixture (fixtureName) {
    const fixtures = new Fixtures({
        dir: path.join(fixturesDirectory, fixtureName),
        mute: false,
    });

    await fixtures.connect(databaseHost + "/" + dbName);
    await fixtures.unload();
    await fixtures.load();
    await fixtures.disconnect();
}

//
// Unload a fixture from the database.
//
async function unloadFixture(fixtureName) {
    const fixtures = new Fixtures({
        dir: path.join(fixturesDirectory, fixtureName),
        mute: false,
    });

    await fixtures.connect(databaseHost + "/" + dbName);
    await fixtures.unload();
    await fixtures.disconnect();
}

async function main() {

    const client = await connectDatabase();
    const db = client.db(dbName);

    app.get("/load-fixture", (req, res) => {
        if (!req.query && !req.query.name) {
            res.status(400).send("Specify query parameter 'name'");
        }

        const fixtureName = req.query.name;
        loadFixture(fixtureName)
            .then(() => {
                console.log("Loaded database fixture: " + fixtureName);
                res.sendStatus(200);
            })
            .catch(err => {
                const msg = "Failed to load database fixture " + fixtureName;
                console.error(msg);
                console.error(err && err.stack || err);
                res.status(400).send(msg);
            });
    });

    app.get("/unload-fixture", (req, res) => {
        if (!req.query && !req.query.name) {
            res.status(400).send("Specify query parameter 'name'");
        }

        const fixtureName = req.query.name;
        unloadFixture(fixtureName)
            .then(() => {
                console.log("Unloaded database fixture: " + fixtureName);
                res.sendStatus(200);
            })
            .catch(err => {
                const msg = "Failed to unload database fixture " + fixtureName;
                console.error(msg);
                console.error(err && err.stack || err);
                res.status(400).send(msg);
            });
    });
    
    app.get("/drop-collection", (req, res) => {
        if (!req.query && !req.query.name) {
            res.status(400).send("Specify query parameter 'name'");
        }

        const collectionName = req.query.name;
        db.dropCollection(collectionName)
            .then(() => {
                console.log("Dropped collection: " + collectionName);
                res.sendStatus(200);
            })
            .catch(err => {
                const msg = "Failed to drop collection " + collectionName;
                console.error(msg);
                console.error(err && err.stack || err);
                res.status(400).send(msg);
            });
    });    
    
    await startServer();
}

main()
    .catch(err => {
        console.error("DB fixture REST API failed to start.");
        console.error(err && err.stack || err);
    });


