import Defaults from './Defaults';
import NoiseFragmentShader from './shaders/NoiseFrag.glsl';
import NoiseVertexShader from './shaders/NoiseVert.glsl';

class HeightMap {
    constructor(options) {
        this._options = _.defaults(options || {}, {
            resolution: Defaults.gridSize,
            speedMultiplier: Defaults.speedMultiplier,
            mapFunction: HeightMap.PERLIN_NOISE
        });

        this._textureVisible = false;
        this._pixelBuffer = new Uint8Array(this._options.resolution * this._options.resolution * 4);
        this._create();
    }

    set textureVisible(v) {
        if (this._textureVisible === v) {
            return;
        }

        const renderer = this._renderer;
        if (v) {
            renderer.domElement.style.top = '48px';
            renderer.domElement.style.left = 0;
            renderer.domElement.style.width = '80px';
            renderer.domElement.style.height = '80px';
            renderer.domElement.style.position = 'fixed';
            document.body.appendChild(renderer.domElement);
        }
        else {
            document.body.removeChild(renderer.domElement);
        }

        this._textureVisible = v;
    }

    get textureVisible() {
       return this._textureVisible;
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
    
    get mapFunction() {
        return this._options.mapFunction;    
    }
    
    set mapFunction(f) {
        const options = this._options;
        const material = this._material;

        if (options.mapFunction === f) {
            return;
        }

        options.mapFunction = f;
        material.uniforms['mapFunction'].value = f;
    }

    _create() {
        const options = this._options;

        const renderer = this._renderer = new THREE.WebGLRenderer({antialias: false});
        renderer.setSize(options.resolution, options.resolution);

        const target = this._target = new THREE.WebGLRenderTarget(options.resolution, options.resolution);
        const camera = this._camera = new THREE.OrthographicCamera(options.resolution / -2, options.resolution / 2, options.resolution / 2, options.resolution / -2, -1000, 1000);
        const scene = this._scene = new THREE.Scene();

        const material = this._material = new THREE.ShaderMaterial({
            uniforms: {
                time: {type: 'f', value: 0},
                mapFunction: {type: 'i', value: options.mapFunction},
                resolution: {type: 'f', value: options.resolution}
            },
            vertexShader: NoiseVertexShader,
            fragmentShader: NoiseFragmentShader
        });

        var plane = new THREE.PlaneGeometry(options.resolution, options.resolution);
        var quad = new THREE.Mesh(plane, material);
        scene.add(quad);
    }

    update() {
        const renderer = this._renderer;
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

        if (this._textureVisible) {
            renderer.render(scene, camera);
        }
    }
}

HeightMap.PERLIN_NOISE = 0;
HeightMap.SINE = 1;

export default HeightMap;