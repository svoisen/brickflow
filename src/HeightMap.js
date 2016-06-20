import Defaults from './Defaults';
import NoiseFragmentShader from './shaders/NoiseFrag.glsl';
import NoiseVertexShader from './shaders/NoiseVert.glsl';

export default class HeightMap {
    constructor(options) {
        this._options = _.defaults(options || {}, {
            resolution: Defaults.gridSize,
            speedMultiplier: Defaults.speedMultiplier
        });

        this._pixelBuffer = new Uint8Array(this._options.resolution * this._options.resolution * 4);
        this._create();
    }

    get data() {
        return this._pixelBuffer;
    }

    get texture() {
        return this._target.texture;
    }

    get speedMultiplier() {
        return this._options.speedMultiplier;
    }

    set speedMultiplier(v) {
        this._options.speedMultiplier = v;
    }

    _create() {
        const options = this._options;

        const target = this._target = new THREE.WebGLRenderTarget(options.resolution, options.resolution);
        const camera = this._camera = new THREE.OrthographicCamera(options.resolution / -2, options.resolution / 2, options.resolution / 2, options.resolution / -2, -1000, 1000);
        const scene = this._scene = new THREE.Scene();

        const material = this._material = new THREE.ShaderMaterial({
            uniforms: {
                time: {type: 'f', value: 0}
            },
            vertexShader: NoiseVertexShader,
            fragmentShader: NoiseFragmentShader
        });

        var plane = new THREE.PlaneGeometry(options.resolution, options.resolution);
        var quad = new THREE.Mesh(plane, material);
        scene.add(quad);
    }

    update(renderer) {
        const scene = this._scene;
        const camera = this._camera;
        const target = this._target;
        const material = this._material;
        const options = this._options;

        if (_.isUndefined(this._startTime)) {
            this._startTime = Date.now();
        }

        material.uniforms['time'].value = 0.001 * options.speedMultiplier * (Date.now() - this._startTime);
        renderer.render(scene, camera, target);
        renderer.readRenderTargetPixels(target, 0, 0, options.resolution, options.resolution, this._pixelBuffer);
    }
}