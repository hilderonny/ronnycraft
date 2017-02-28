var voxelEngine = require('voxel-engine');
var voxelPlayer = require('voxel-player');
var voxelReach = require('voxel-reach');

var game;
var avatar;

// Initialize Websockets
var socket = io();
socket.on('msg', function(message) {
    switch(message.type) {
        case 'create': game.createBlock(message.position, 2); break;
        case 'remove': game.setBlock(message.position, 0); break;
    }
});
socket.on('loadChunk', function(chunk) {
    game.showChunk(chunk);
    if (!avatar) {
        avatar = voxelPlayer(game)('textures/player.png');
        avatar.possess();
        avatar.yaw.position.set(4, 1, 4);
    }
});

// Simulate asynchronous chunk loading
function loadChunk(x, y, z, callback) {
    var position = [x,y,z];
    socket.emit('loadChunk', position);
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


- voxel-inventory-hotbar : Inventarleiste
- voxel-harvest : Blöcke in Inventar verschieben nach Abbau
- Blocktypen

- Mobile Version mit Touch-Gesten

*/
