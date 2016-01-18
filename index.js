"use strict";

var express = require('express');
var app = express();
var pgp = require("pg-promise")(/*options*/);
var db = pgp(process.env.DATABASE_URL);

// respond with "hello world" when a GET request is made to the homepage

app.use('/static', express.static('static'));
app.get('/', (req, res) => {
    res.sendFile('static/index.html', {root: __dirname});
});
app.get('/api/subreddits', (req, res) => {
    db.many("SELECT DISTINCT name FROM subreddit")
        .then(function (data) {
            res.send(data.map(row => row.name));
        })
        .catch(function (error) {
            console.log("ERROR:", error);
        });
});

app.get('/api/markov', (req, res) => {
    let word = req.params.w;
    let subreddit = req.params.s;

    db.many("SELECT * FROM nodes WHERE ")
        .then(function (data) {
            res.send(data.map(row => row.name));
        })
        .catch(function (error) {
            console.log("ERROR:", error);
        });
});


app.listen(process.env.PORT);
console.log(`Listening on port ${process.env.PORT}`);