const NUB_HEIGHT = 10;
const NUB_MARGIN = 10;

export default class Brick extends THREE.Object3D {
    constructor(options) {
        super();
        
        this._options = _.defaults(options || {}, {
            size: 50,
            height: 50
        });

        this._height = options.height;
        this._create();
    }

    set height(value) {
        if (value === this._height) {
            return;
        }

        const cube = this._cube;
        const nub = this._nub;

        cube.scale.y = value / this._height;
        cube.position.y = value * 0.5;
        nub.position.y = value + NUB_HEIGHT * 0.5;

        this._height = value;
    }

    get height() {
        return this._height;
    }

    _create() {
        const options = this._options;

        var mat = new THREE.MeshLambertMaterial({color: 0xff0000});
        var cubeGeo = new THREE.BoxGeometry(options.size, this._height, options.size);
        var cube = this._cube = new THREE.Mesh(cubeGeo, mat);

        var nubRadius = options.size * 0.5 - NUB_MARGIN;
        var nubGeo = new THREE.CylinderGeometry(nubRadius, nubRadius, NUB_HEIGHT, 32);
        var nub = this._nub = new THREE.Mesh(nubGeo, mat);
        nub.position.set(options.size * 0.5, this._height + NUB_HEIGHT * 0.5, options.size * 0.5);

        this.add(cube);
        this.add(nub);
    }
}