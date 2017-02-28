var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var browserify = require('browserify')();
var fs = require('fs');
var http = require('http');
var socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 5000;
var dbUri = process.env.MONGODB_URI || 'mongodb://localhost/ronnycraft';

// Initialize websockets
var io = socketIo(server);
io.on('connection', (socket) => {
    socket.on('msg', (message) => {
        io.emit('msg', message); // Also send back to sender so that the sender can also handle block creation / deletion
    });
});

// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
// Initialize database connection before starting the app
MongoClient.connect(dbUri, (err, db) => {
    if(err) throw err;

    // Generate client side includes
    console.log(`Generating client side code`);
    browserify.add(__dirname + '/client/html/index.js');
    browserify.bundle().pipe(fs.createWriteStream(__dirname + '/client/html/generated.js'));

    // Store db connection in request object req.db
    app.use((req, res, next) => {
        req.db = db;
        next();
    });
    // parses body content sent with POST and PUT as JSON and stores it into req.body
    app.use(require('body-parser').json());

    // Server static content
    app.use(express.static(__dirname + '/client/html'));
    app.use('/node_modules', express.static(__dirname + '/node_modules'));

    // Start application
    server.listen(port, function() {
        console.log(`Application is running on port ${port}`);
    });
});
