import Brick from './Brick';

export default class BrickGrid extends THREE.Object3D {
    constructor(options) {
        super();

        this._options = _.defaults(options || {}, {
            rows: 10,
            cols: 10,
            brickSize: 50,
            minHeight: 50,
            maxHeight: 200
        });

        this._bricks = [];
        this._create();
    }

    update(heightMapData) {
        const options = this._options;
        const bricks = this._bricks;

        for (let i = 0, colsLen = options.cols; i < colsLen; i++) {
            for (let j = 0, rowsLen = options.rows; j < rowsLen; j++) {
                let brick = bricks[i][j];
                let heightVal = heightMapData[j * colsLen * 4 + i * 4];
                brick.height = heightVal / 255 * (options.maxHeight - options.minHeight) + options.minHeight;
            }
        }
    }
   
    _create() {
        const options = this._options;
        const bricks = this._bricks;
        const xOffset = (options.cols * options.brickSize) * 0.5;
        const zOffset = (options.rows * options.brickSize) * 0.5;

        for (let i = 0, colLen = options.cols; i < colLen; i++) {
            for (let j = 0, rowLen = options.rows; j < rowLen; j++) {
                if (_.isUndefined(bricks[i])) {
                    bricks[i] = [];
                }
                let brick = new Brick({
                    size: options.brickSize
                });
                brick.position.set(i * options.brickSize - xOffset, brick.height * 0.5, j * options.brickSize - zOffset);
                bricks[i][j] = brick;
                this.add(brick);
            }
        }
    }
}