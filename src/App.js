import Stats from 'stats.js';
import DAT from 'dat-gui';
import Model from './Model';
import HeightMap from './HeightMap';
import BrickGrid from './BrickGrid';

export default class App {
    constructor() {
        this._bind('_render', '_handleResize');
        this._setup3D();
        this._setupDataModel();
        this._setupHeightMap();
        this._createScene();
        this._createGUI();

        window.addEventListener('resize', '_handleResize');
    }

    start() {
        const camera = this._camera;
        const scene = this._scene;

        this._start = Date.now();
        camera.lookAt(scene.position);
        requestAnimationFrame(this._render);
    }

    _bind(...methods) {
        methods.forEach((method) => this[method] = this[method].bind(this));
    }

    _setup3D() {
        const renderer = this._renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const camera = this._camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -1000, 1000);
        camera.position.set(10, 10, 10);

        const scene = this._scene = new THREE.Scene();
        camera.lookAt(scene.position);
        scene.add(camera);

        const stats = this._stats = new Stats();
    }

    _setupHeightMap() {
        const model = this._model;

        const heightMap = this._heightMap = new HeightMap({
            resolution: model.gridSize,
            mapFunction: model.mapFunction,
            speedMultiplier: model.speedMultiplier
        });
    }

    _setupDataModel() {
        const model = this._model = new Model();

        model.addEventListener('change:color', function(event) {
            this._grid.color = new THREE.Color(event.value);
        }.bind(this));

        model.addEventListener('change:minLightness', function(event) {
            this._grid.minLightness = event.value;
        }.bind(this));

        model.addEventListener('change:maxLightness', function(event) {
            this._grid.maxLightness = event.value;
        }.bind(this));

        model.addEventListener('change:minHeight', function(event) {
            this._grid.minHeight = event.value;
        }.bind(this));

        model.addEventListener('change:maxHeight', function(event) {
            this._grid.maxHeight = event.value;
        }.bind(this));
        
        model.addEventListener('change:speedMultiplier', function(event) {
            this._heightMap.speedMultiplier = event.value;
        }.bind(this));

        model.addEventListener('change:showDebug', function(event) {
            if (event.value) {
                document.body.appendChild(this._stats.dom);
            }
            else {
                document.body.removeChild(this._stats.dom);
            }
            this._heightMap.textureVisible = event.value;
        }.bind(this));

        model.addEventListener('change:mapFunction', function(event) {
            this._heightMap.mapFunction = event.value;
        }.bind(this));
    }

    _createGUI() {
        const model = this._model;
        const gui = this._gui = new DAT.GUI({
            height: 5 * 32 - 1
        });
        gui.addColor(model, 'color').name('Color');
        gui.add(model, 'minLightness').min(0).max(1).name('Min Lightness');
        gui.add(model, 'maxLightness').min(0).max(1).name('Max Lightness');
        gui.add(model, 'minHeight').min(10).max(500).name('Min Height');
        gui.add(model, 'maxHeight').min(10).max(500).name('Max Height');
        gui.add(model, 'speedMultiplier').min(0).max(2).name('Speed');
        gui.add(model, 'mapFunction', {"Perlin Noise": HeightMap.PERLIN_NOISE, "Sine Wave": HeightMap.SINE}).name('Map Function');
        gui.add(model, 'showDebug').name('Show Debug');
    }

    _createScene() {
        const scene = this._scene;
        const model = this._model;

        this._createLights();

        var grid = this._grid = new BrickGrid({
            rows: model.gridSize,
            cols: model.gridSize,
            color: model.color,
            minLightness: model.minLightness,
            maxLightness: model.maxLightness
        });
        grid.position.x += 100;
        grid.position.z += 100;
        scene.add(grid);
    }

    _createLights() {
        const scene = this._scene;

        var ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xf0f0f0);
        directionalLight.position.set(0, 200, 100);
        directionalLight.lookAt(scene.position);
        scene.add(directionalLight);
    }
    
    _render(timestamp) {
        const scene = this._scene;
        const camera = this._camera;
        const renderer = this._renderer;
        const stats = this._stats;
        const heightMap = this._heightMap;
        const grid = this._grid;

        stats.begin();
        heightMap.update();
        grid.update(heightMap.data);
        renderer.render(scene, camera);
        stats.end();

        requestAnimationFrame(this._render);
    }

    _handleResize(event) {
        const renderer = this._renderer;
        const camera = this._camera;

        camera.left = window.innerWidth / -2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = window.innerHeight / -2;

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
