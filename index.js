var express = require('express');
const path = require('path');
var router = express.Router();
const PORT = process.env.PORT || 5000;
const request = require('request');
const fs = require('fs');

var deckID = "";
var drawnCard = 0;
var deck = null
var highScores = null;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
app.use(express.urlencoded({
    extended: true
}));


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* GET home page. */
app.get('/', function(req, res, next) {
    res.render('HighLow', { title: 'High-Low' });
});

app.get('/newGame', function(req, res) {
    getNewDeck(function(deckObject) {
        deck = deckObject;
        deckID = deckObject.deck_id;
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

app.get('/getScores', function(req, res) {
    let rawdata = fs.readFileSync('public/scores.json');
    highScores = JSON.parse(rawdata);
    console.log(highScores[0]);
    highScores.sort(function(a, b) { return b.highScores - a.highScores });
    console.log(highScores[0]);

    res.send(highScores);
});

app.post('/addScore', (req, res) => {
    console.log("Got to add score");
    var score = req.body.Score;
    var initials = req.body.Initials;
    console.log(score);
    console.log(initials);
    var len = highScores.length;
    var lowestScore = highScores[len - 1].Score;
    if (score > lowestScore || len < 10) {
        //var initials = prompt("You've acheived a high score! Please enter your initials", "ABC");
        if (initials != null && initials != "") {
            var newScore = {
                Initials: initials,
                Score: score
            };
            highScores.push(newScore);
            highScores.sort(function(a, b) {
                return b.Score - a.Score
            });
            if (len >= 10) {
                highScores.pop();
            }
        }
    }
    fs.writeFileSync('public/scores.json', JSON.stringify(highScores));
    var result = { success: true };
    res.status(200).json(result);
});


function getNewDeck(callback) {
    if (deckID == "") {
        request('https://deckofcardsapi.com/api/deck/new/draw/?count=52', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            callback(body);
        });
    } else {
        request('https://deckofcardsapi.com/api/deck/' + deckID + '/shuffle/', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            //callback(body);
            request('https://deckofcardsapi.com/api/deck/' + deckID + '/draw/?count=52', { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                callback(body);
            });
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