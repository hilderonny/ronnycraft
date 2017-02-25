var voxelEngine = require('voxel-engine');
var voxelPlayer = require('voxel-player');

var game = voxelEngine({
    materials: ['grass'],
    generate: function(x, y, z) {
        return y === 0 ? 1 : 0;
    }
});

game.appendTo(document.body);

var avatar = voxelPlayer(game)('textures/player.png');
avatar.possess();
avatar.yaw.position.set(0, 1, 4);
