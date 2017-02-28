function createMaterials(scene) {
    scene.materials = [];
    var grassMaterial = new BABYLON.StandardMaterial(null, scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("textures/grass.png", scene, false, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
    scene.materials.push(grassMaterial);
}

function createBlock(scene, x, y, z) {
    var block = BABYLON.Mesh.CreateBox(null, 1, scene);
    block.position = new BABYLON.Vector3(x, y, z);
    block.material = scene.materials[0];
}

function createScene(engine) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.FromHexString('#BFD1E5');

    createMaterials(scene);

    var camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(engine.getRenderingCanvas(), false);

    new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

    var w = 100;
    for (var x = -w; x < w; x++) {
        for (var z = -w; z < w; z++) {
            createBlock(scene, x, 0, z);
        }
    }

    return scene;
}

window.addEventListener('load', function() {
    var canvas = document.querySelector('#renderCanvas');
    canvas.addEventListener('click', function() {
        canvas.requestPointerLock();
    });
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene(engine);
    engine.runRenderLoop(function() {
        scene.render();
    });
    window.addEventListener('resize', function() {
        engine.resize();
    });
});
