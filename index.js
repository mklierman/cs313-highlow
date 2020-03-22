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

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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
        drawnCard = 0;
    });
});

app.get('/drawCard', function(req, res) {
    drawCard(function(result) {});
    compareCards(function(result) {
        var resultObject = '{"resultText": "' + result + '", "imageURL": "' + deck.cards[drawnCard].image + '"}';
        res.send(JSON.parse(resultObject));
    })

});

function getNewDeck(callback) {
    if (deckID == "") {
        request('https://deckofcardsapi.com/api/deck/new/draw/?count=52', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            callback(body);
        });
    } else {
        request('https://deckofcardsapi.com/api/' + deckID + '/shuffle', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            callback(body);
        });
    }
}

function drawCard(callback) {
    drawnCard++;
    callback(true);
}

function compareCards(callback) {
    var result = "";
    var oldValue = parseInt(deck.cards[drawnCard - 1].value);
    var newValue = parseInt(deck.cards[drawnCard].value);
    console.log(oldValue);
    console.log(newValue);
    if (newValue > oldValue) {
        result = "Higher";
        console.log("Higher: " + newValue + " > " + oldValue);
    } else if (newValue < oldValue) {
        console.log("Lower: " + newValue + " < " + oldValue);
        result = "Lower";
    } else {
        result = "Even";
    }
    callback(result);
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