
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");
var db = require("./models");
var PORT = 8080;
var exphbs = require('express-handlebars');
var path = require('path');
var app = express();


//configure middleware
//use morgan logger for logging requests


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// // Initialize handlebars
// app.engine("handlebars", exphbs({defaultLayout: "main"}));
// app.set("view engine", "handlebars");

// Routes

// A GET route for scraping the hacker news website

app.get("/scrape", function(req, res){

    request("https://news.ycombinator.com/", function(error, response, html){

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        $("td.title").each(function(i, element){
            var results = {};

           results.title = $(this).children("a").text();

           results.link = $(this).children().attr("href");



            db.News.create(results)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                 console.log(err);
                });
        });

    });

    res.send("scrape done")
});

app.get("/news", function(req, res){

    db.News.find({})
        .then(function(dbArticle){
            res.json(dbArticle)
        })
        .catch(function(err){
            res.json(err)
        });

});

app.get("/news/:id", function(req,res){
    db.News.findOne({_id: req.params.id})
        .populate("note")
        .then(function(dbArticle){
            res.json(dbArticle)
        })
        .catch(function(err){
            res.json(err);
        });
});

app.post("/news/:id", function(req, res){

    db.Note.create(req.body)
        .then(function(dbNote){
            return db.News.findOneAndUpdate({_id: req.params.id},{note: dbNote._id}, {new: true});
        })
        .then(function(dbArticle){
            res.json(dbArticle)
        })
        .catch(function(err){
            res.json(err);
        })

});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});