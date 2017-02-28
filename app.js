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

// Generate chunks
var loadChunk = (db, position, callback) => {
    var chunkId = position.join('|');
    var collection = db.collection('chunks');
    collection.findOne({chunkId:chunkId}, (err, chunk) => {
        if (!chunk) {
            var chunk = {
                chunkId:chunkId,
                position:position,
                voxels:new Int8Array(32*32*32),
                dims:[32,32,32]
            }
            var y32 = position[1] * 32;
            for (vz = 0, n = 0; vz < 32; ++vz) {
                for (vy = 0, y_vy = y32; vy < 32; ++vy, ++y_vy) {
                    for (vx = 0; vx < 32; ++vx, ++n) {
                        if (y_vy < 0) {
                            chunk.voxels[n] = 2;
                        } else if (y_vy === 0) {
                            chunk.voxels[n] = 1;
                        }
                    }
                }
            }
            collection.insert(chunk, {fullResult:true}, (err, insertedChunk) => {
                callback(collection, insertedChunk);
            });
        } else {
            callback(collection, chunk);
        }
    });
};

// Handle chunk manipulation
var createBlock = (db, position, callback) => {
    setBlock(db, position, 2, callback);
};
var removeBlock = (db, position, callback) => {
    setBlock(db, position, 0, callback);
};
var setBlock = (db, position, type, callback) => {
    var chunkPosition = [Math.floor(position[0] / 32), Math.floor(position[1] / 32), Math.floor(position[2] / 32)];
    loadChunk(db, chunkPosition, (collection, chunk) => {
        var x = position[0] - chunkPosition[0]*32;
        var y = position[1] - chunkPosition[1]*32;
        var z = position[2] - chunkPosition[2]*32;
        var n = (z*32+y)*32+x;
        chunk.voxels[n] = type;
        collection.update({_id:chunk._id}, {$set:{voxels:chunk.voxels}}, (err, updatedChunk) => {
            callback(updatedChunk);
        });
    });
}

// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
// Initialize database connection before starting the app
MongoClient.connect(dbUri, (err, db) => {
    if(err) throw err;

    // Initialize collections, let it do in the background and do not wait for completion
    db.createCollection('chunks');

    // Initialize websockets
    var io = socketIo(server);
    io.on('connection', (socket) => {
        socket.on('msg', (message) => {
            var callback = () => {
                io.emit('msg', message); // Also send back to sender so that the sender can also handle block creation / deletion
            };
            switch(message.type) {
                case 'create': createBlock(db, message.position, callback); break;
                case 'remove': removeBlock(db, message.position, callback); break;
            }
        });
        socket.on('loadChunk', (position) => {
            var chunk = loadChunk(db, position, (collection, chunk) => {
                socket.emit('loadChunk', chunk);
            });
        })
    });

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
