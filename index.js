"use strict";

var express = require('express');
var morgan = require('morgan');
var app = express();
var pgp = require("pg-promise")(/*options*/);
var db = pgp(process.env.DATABASE_URL);

//Cache subreddit list in memory
let subreddits = [];
db.many(`
    SELECT DISTINCT
        subreddit.name,
        subreddit.id
    FROM
        subreddit
        JOIN node ON node.subreddit_id = subreddit.id
    `)
    .then(function (data) {
        subreddits = data;
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });

app.use(morgan('combined'));
app.use('/static', express.static('static'));
app.get('/', (req, res) => {
    res.sendFile('static/index.html', {root: __dirname});
});
app.get('/api/subreddits', (req, res) => {
   res.send(subreddits);
});

let oldQuery =`
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
    `;

app.get('/api/initial', (req, res) => {
    db.one(`
        SELECT
            node.id
        FROM
            node
        WHERE
            node.subreddit_id = $1
            AND node.state[1] = $2
            AND node.state[2] = $3

            --AND key ~ '[[:alnum:]_]';
    ` , [req.query.sub, req.query.s1, req.query.s2]
        )
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            console.log("ERROR:", error);
        });
});

app.get('/api/markov', (req, res) => {
    db.many(`
        SELECT
            edge.weight,
            too.state[2] as name,
            too.id as "dbId"
        FROM
            node fromm
            JOIN edge ON fromm.id = edge.from_node_id
	        JOIN node too ON too.id = edge.to_node_id
        WHERE
            fromm.id = $1
            --AND key ~ '[[:alnum:]_]'
        ORDER BY edge.weight DESC
        LIMIT 10;
    ` , [req.query.node]
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