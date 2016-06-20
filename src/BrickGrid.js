import Defaults from './Defaults';
import Brick from './Brick';

function mapRange(val, inMin, inMax, outMin, outMax) {
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export default class BrickGrid extends THREE.Object3D {
    constructor(options) {
        super();

        this._options = _.defaults(options || {}, {
            rows: Defaults.gridSize,
            cols: Defaults.gridSize,
            brickSize: 50,
            minHeight: Defaults.minHeight,
            maxHeight: Defaults.maxHeight,
            minLightness: Defaults.minLightness,
            maxLightness: Defaults.maxLightness,
            color: Defaults.color
        });

        Object.keys(this._options).forEach(prop => {
            Object.defineProperty(this, prop, {
                set (value) {
                    this._options[prop] = value;
                },
                get () {
                    return this._options[prop];
                }
            });
        });

        this._bricks = [];
        this._create();
    }

    update(heightMapData) {
        const options = this._options;
        const bricks = this._bricks;
        var curHSL = new THREE.Color(options.color).getHSL();

        for (let i = 0, colsLen = options.cols; i < colsLen; i++) {
            for (let j = 0, rowsLen = options.rows; j < rowsLen; j++) {
                let brick = bricks[i][j];
                let heightVal = heightMapData[j * colsLen * 4 + i * 4];
                let lightness = mapRange(heightVal, 0, 255, options.minLightness, options.maxLightness);
                brick.height = mapRange(heightVal, 0, 255, options.minHeight, options.maxHeight);
                brick.color = new THREE.Color().setHSL(curHSL.h, curHSL.s, lightness);
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
                    size: options.brickSize,
                    color: new THREE.Color(options.color)
                });
                brick.position.set(i * options.brickSize - xOffset, brick.height * 0.5, j * options.brickSize - zOffset);
                bricks[i][j] = brick;
                this.add(brick);
            }
        }
    }
}