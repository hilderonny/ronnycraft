function createScene(engine) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.FromHexString("#BFD1E5");

    var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(engine.getRenderingCanvas(), false);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;
    
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
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
