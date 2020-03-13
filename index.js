var express = require('express');
const path = require('path');
var router = express.Router();
const PORT = process.env.PORT || 5000;
const request = require('request');

var deckID = "";
var drawnCard = 0;
var deck = null

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

/* GET home page. */
app.get('/', function(req, res, next) {
    res.render('HighLow', { title: 'High-Low' });
});

app.get('/newGame', function(req, res) {
    getNewDeck(function(deckObject) {
        deck = deckObject;
        console.log(deck.deck_id);
        console.log(deck.cards[0].code);
        var cardURL = deck.cards[0].image;
        res.send(cardURL);
        setCardValues();
    });
});

function getNewDeck(callback) {
    request('https://deckofcardsapi.com/api/deck/new/draw/?count=52', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(body);
    });
}

function drawCard(callback) {
    drawnCard++;

}

function compareCards() {
    var result = "";
    if (deck.cards[drawnCard].value > deck.cards[drawnCard - 1].value) {
        result = "Higher";
    } else if (deck.cards[drawnCard].value < deck.cards[drawnCard - 1].value) {
        result = "Lower";
    } else {
        result = "Even";
    }
}

function setCardValues() {
    for (i = 0; i < 52; i++) {
        switch (deck.cards[i].value) {
            case 'KING':
                deck.cards[i].value = '13';
                break;
            case 'QUEEN':
                deck.cards[i].value = '12';
                break;
            case 'JACK':
                deck.cards[i].value = '11';
                break;
            case 'ACE':
                deck.cards[i].value = '1';
                break;
        }
    }
}

module.exports = router;