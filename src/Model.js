import Defaults from './Defaults';

export default class Model extends THREE.EventDispatcher {
    constructor(options) {
        super();

        this.observe(_.defaults(options || {}, {
            color: Defaults.color,
            minHeight: Defaults.minHeight,
            maxHeight: Defaults.maxHeight,
            minLightness: Defaults.minLightness,
            maxLightness: Defaults.maxLightness,
            showDebug: false,
            gridSize: Defaults.gridSize,
            speedMultiplier: Defaults.speedMultiplier
        }));
    }

    observe(props = {}) {
        this._props = props;
        Object.keys(props).forEach(prop => {
            Object.defineProperty(this, prop, {
                set (value) {
                    this.dispatchEvent({type: `change:${prop}`, value: value});
                    this._props[prop] = value;
                },
                get () {
                    return this._props[prop];
                }
            });
            this[prop] = props[prop];
        }, this);
    }
}