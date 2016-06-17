import Brick from './Brick';

export default class BrickGrid extends THREE.Object3D {
    constructor(options) {
        super();

        this._options = _.defaults(options || {}, {
            rows: 64,
            cols: 64,
            brickSize: 50
        });
        
        this._create();
    }

    update(heightMapData) {
        const options = this._options;
        
    }
   
    _create() {
        const options = this._options;
        const xOffset = (options.cols * options.brickSize) * 0.5;
        const zOffset = (options.rows * options.brickSize) * 0.5;

        for (let i = 0, colLen = options.cols; i < colLen; i++) {
            for (let j = 0, rowLen = options.rows; j < rowLen; j++) {
                let brick = new Brick({
                    size: options.brickSize,
                });
                brick.position.set(i * options.brickSize - xOffset, brick.height * 0.5, j * options.brickSize - zOffset);
                this.add(brick);
            }
        }
    }
}