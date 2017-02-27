var voxelEngine = require('voxel-engine');
var voxelPlayer = require('voxel-player');
var voxelHighlight = require('voxel-highlight');

// Initialize the game engine itself
var game = voxelEngine({
    materials: [['grass', 'dirt', 'grass_dirt'], 'dirt'],
    generate: function(x, y, z) {
        if (y < 0) return 2;
        if (y === 0) return 1;
        return 0;
    },
    controls: {
        jumpMaxSpeed: 0.008, // Limit jump height
        discreteFire: true // No repeating fire events
    }
});
game.appendTo(document.body);

// Create player as avatar
var avatar = voxelPlayer(game)('textures/player.png');
avatar.possess();
avatar.yaw.position.set(0, 1, 4);
window.addEventListener('keydown', function (ev) { // Pressing "R" toggles between perspectives
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        avatar.toggle();
    }
});

// Add highlighting of element the player looks materials
var highlighter = voxelHighlight(game);
highlighter.on('highlight', function (voxelPos) { highlighter.erasePosition = voxelPos });
highlighter.on('remove', function (voxelPos) { highlighter.erasePosition = null });
highlighter.on('highlight-adjacent', function (voxelPos) { highlighter.placePosition = voxelPos });
highlighter.on('remove-adjacent', function (voxelPos) { highlighter.placePosition = null });

// Handle clicks on blocks
game.on('fire', function(target, state) {
    if (highlighter.erasePosition) {
        game.setBlock(highlighter.erasePosition, 0);
    }
});

/*
TO IMPLEMENT:

- voxel-mine : Abbau von Blöcken
- voxel-use : Rechte Maustaste, Platzieren von Objekten

- Websockets zu  Austausch von Informationen unter Clients (socket.io)
- Serverdatenbank für Chunks


- voxel-inventory-hotbar : Inventarleiste
- voxel-harvest : Blöcke in Inventar verschieben nach Abbau

- Mobile Version mit Touch-Gesten

*/
