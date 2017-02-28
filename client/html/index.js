var voxelEngine = require('voxel-engine');
var voxelPlayer = require('voxel-player');
var voxelReach = require('voxel-reach');

var game;

// Initialize Websockets
var socket = io();
socket.on('msg', function(message) {
    switch(message.type) {
        case 'create': game.createBlock(message.position, 2); break;
        case 'remove': game.setBlock(message.position, 0); break;
    }
});

// Simulate asynchronous chunk loading
function loadChunk(x, y, z, callback) {
    setTimeout(function() {
        var chunk = {
            position:[x,y,z],
            voxels:new Int8Array(32*32*32),
            dims:[32,32,32]
        }
        var y32 = y * 32;
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
        game.showChunk(chunk);
        if (callback) callback();
    }, 1); // Wait 3 seconds before loading, simulating network traffic
}

// Initialize the game engine itself
game = voxelEngine({
    materials: [
        ['grass', 'dirt', 'grass_dirt'], 
        'dirt'
    ],
    generateVoxelChunk: function (low, high, x, y, z) {
        // Trigger asynchronous load and return empty chunk
        loadChunk(x, y, z);
        // Return empty chunk as long as chunk gets loaded
        return {
            position:[x,y,z],
            voxels:new Int8Array(32*32*32),
            dims:[32,32,32],
            empty:true
        };
    },
    controls: {
        jumpMaxSpeed: 0.008, // Limit jump height
        discreteFire: true // No repeating fire events
    }
});
game.appendTo(document.body);

// Create player as avatar
var avatar = voxelPlayer(game)('textures/player.png');
loadChunk(0, 0, 0, function() { // Position the avatar when the first chunk is loaded
    avatar.possess();
    avatar.yaw.position.set(4, 1, 4);
});

window.addEventListener('keydown', function (ev) { // Pressing "R" toggles between perspectives
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        avatar.toggle();
    }
});

// Handle click on blocks to add and remove them
var reach = voxelReach(game, {reachDistance: 8});
reach.on('use', function(target) { 
    if (target) {
        var position = target.adjacent;
        // Only send message to server. The creation is done when the message returns from the server above
        socket.emit('msg', {type:'create',position:position});
    }
});
reach.on('mining', function(target) { 
    if (target) {
        var position = target.voxel;
        // Only send message to server. The deletion is done when the message returns from the server above
        socket.emit('msg', {type:'remove',position:position});
    }
});

/*
TO IMPLEMENT:

- Websockets zu  Austausch von Informationen unter Clients (socket.io)
- Serverdatenbank für Chunks


- voxel-inventory-hotbar : Inventarleiste
- voxel-harvest : Blöcke in Inventar verschieben nach Abbau

- Mobile Version mit Touch-Gesten

*/
