"use strict";

var express = require('express');
var morgan = require('morgan');
var app = express();
var pgp = require("pg-promise")(/*options*/);
var db = pgp(process.env.DATABASE_URL);

// respond with "hello world" when a GET request is made to the homepage

app.use(morgan('combined'));
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
    db.one(`
        SELECT
            top_ten
        FROM
            node
            JOIN subreddit ON node.subreddit_id = subreddit.id
	        JOIN node_top_ten ON node_top_ten.id = node.id
        WHERE
            subreddit.name = $1
            AND node.state[1] = $2
            AND node.state[2] = $3
            --AND key ~ '[[:alnum:]_]';
    `, [req.query.sub, req.query.s1, req.query.s2]
        )
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log("ERROR:", error);
        });
});


app.listen(process.env.PORT);
console.log(`Listening on port ${process.env.PORT}`);