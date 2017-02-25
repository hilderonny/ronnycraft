var express = require('express');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var port = process.env.PORT || 5000;
var dbUri = process.env.MONGODB_URI || 'mongodb://localhost/ronnycraft';

// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
// Initialize database connection before starting the app
MongoClient.connect(dbUri, (err, db) => {
    if(err) throw err;
    // Store db connection in request object req.db
    app.use((req, res, next) => {
        req.db = db;
        next();
    });
    // parses body content sent with POST and PUT as JSON and stores it into req.body
    app.use(require('body-parser').json());

    // Server static content
    app.use(express.static(__dirname + '/client/html'));
    
    // Start application
    app.listen(port, function() {
        console.log(`Application is running on port ${port}`);
    });
});
