import Stats from 'stats.js';
import NoiseFragmentShader from './shaders/NoiseFrag.glsl';
import NoiseVertexShader from './shaders/NoiseVert.glsl';
import HeightMap from './HeightMap';
import BrickGrid from './BrickGrid';

const NEAR = 0.1;
const FAR = 1000;

export default class App {
    constructor() {
        this._bind('_render', '_handleResize');
        this._setup3D();
        this._setupNoise();
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
        const heightMap = this._heightMap = new HeightMap();
    }

    _setupNoise() {
        const noiseMaterial = this._noiseMaterial = new THREE.ShaderMaterial({
            fragmentShader: NoiseFragmentShader,
            vertexShader: NoiseVertexShader,
            uniforms: {
                time: {type: 'f', value: 0}
            }
        });
    }

    _createScene() {
        const scene = this._scene;

        this._createLights();

        var floor = new THREE.GridHelper(200, 50, 0x333333, 0x333333);
        scene.add(floor);

        var pPlaneGeo = new THREE.PlaneGeometry(100, 100);
        var pPlane = new THREE.Mesh(pPlaneGeo, this._noiseMaterial);
        pPlane.rotation.x = -Math.PI/2;
        pPlane.position.x = -500;
        pPlane.position.z = 100;
        scene.add(pPlane);

        var grid = new BrickGrid();
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

        stats.begin();
        heightMap.update(renderer);
        this._updateNoise(timestamp);
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        stats.end();

        requestAnimationFrame(this._render);
    }

    _updateNoise(timestamp) {
        const start = this._start;
        const noiseMaterial = this._noiseMaterial;

        // var time = .00025 * (Date.now() - this._start);
        var time = .00025 * (Date.now() - this._start);
        noiseMaterial.uniforms['time'].value = time;
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
