import Stats from 'stats.js';
import HeightMap from './HeightMap';
import BrickGrid from './BrickGrid';

const GRID_SIZE = 10;

export default class App {
    constructor() {
        this._bind('_render', '_handleResize');
        this._setup3D();
        this._setupHeightMap();
        this._createScene();

        window.addEventListener('resize', '_handleResize');
    }

    start() {
        this._start = Date.now();
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
        camera.position.set(100, 100, 100);

        const scene = this._scene = new THREE.Scene();
        camera.lookAt(scene.position);
        scene.add(camera);

        const stats = this._stats = new Stats();
        document.body.appendChild(stats.dom);
    }

    _setupHeightMap() {
        const heightMap = this._heightMap = new HeightMap({
            resolution: GRID_SIZE
        });
    }

    _createScene() {
        const scene = this._scene;

        this._createLights();

        var grid = this._grid = new BrickGrid({
            rows: GRID_SIZE,
            cols: GRID_SIZE
        });
        scene.add(grid);

        // var debugSprite = new THREE.Sprite(new THREE.SpriteMaterial({map: this._heightMap.texture}));
        // debugSprite.scale.set(100, 100, 100);
        // debugSprite.position.x = 300;
        // scene.add(debugSprite);

        var debugQuad = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({map: this._heightMap.texture}));
        debugQuad.rotation.x = -Math.PI / 2;
        debugQuad.position.x = 300;
        debugQuad.position.z = -200;
        scene.add(debugQuad);
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
        heightMap.update(renderer);
        grid.update(heightMap.data);
        camera.lookAt(scene.position);
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
