var express = require('express');
const path = require('path');
var router = express.Router();
const PORT = process.env.PORT || 5000;
const request = require('request');

var deckID = "";
var drawnCard = null;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

/* GET home page. */
app.get('/', function(req, res, next) {
    res.render('HighLow', { title: 'High-Low' });
});

app.get('/newGame', function(req, res) {
    getNewDeck(function(deck_id) {
        console.log(deck_id);
        deckID = deck_id;

        drawCard(function(cardObject) {
            console.log(cardObject.image);
            console.log(cardObject.code);
            drawnCard = cardObject;
            var cardURL = drawnCard.image;
            res.send(cardURL);
        });
    });
});

function getNewDeck(callback) {
    request('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(body.deck_id);
    });
}

function drawCard(callback) {
    request('https://deckofcardsapi.com/api/deck/' + deckID + '/draw/?count=1', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(body.cards[0]);
    });
}

module.exports = router;