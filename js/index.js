"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var _ = require("lodash");
var defaultInfo = {
    Name: "(Implementation)",
    HasSetupUI: false
};
var defaultOptions = {
    CPUsPerInstance: 1
};
var ImplementationBase = (function (_super) {
    __extends(ImplementationBase, _super);
    function ImplementationBase(info, workerToKey, options) {
        var _this = _super.call(this) || this;
        _this.workerToKey = workerToKey;
        options = options || defaultOptions;
        options = _.assignIn({}, defaultOptions, options);
        info = info || defaultInfo;
        info = _.assignIn({}, defaultInfo, info);
        _this.__Info = info;
        _this.__CPUsPerInstance = Math.round(_this.boundValue(options.CPUsPerInstance, ImplementationBase.MIN_CPUS_PER_INSTANCE));
        return _this;
    }
    // set min/max bound on value
    ImplementationBase.prototype.boundValue = function (value, min, max) {
        value = Math.max(value, min);
        return (typeof max === "number" ? Math.min(value, max) : value);
    };
    Object.defineProperty(ImplementationBase.prototype, "CPUsPerInstance", {
        get: function () { return this.__CPUsPerInstance; },
        set: function (newValue) {
            if (typeof newValue === 'number') {
                newValue = Math.round(this.boundValue(newValue, ImplementationBase.MIN_CPUS_PER_INSTANCE));
                if (newValue !== this.__CPUsPerInstance) {
                    this.__CPUsPerInstance = newValue;
                    this.emit('change');
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImplementationBase.prototype, "Info", {
        get: function () { return this.__Info; },
        enumerable: true,
        configurable: true
    });
    ImplementationBase.prototype.TranslateToWorkerKeys = function (workers) {
        var workerKeys = [];
        for (var i in workers) {
            var worker = workers[i];
            workerKeys.push(this.workerToKey(worker));
        }
        return Promise.resolve(workerKeys);
    };
    ImplementationBase.prototype.EstimateWorkersLaunchRequest = function (state) {
        var NumInstances = (state.CPUDebt * 1.0) / (this.CPUsPerInstance * 1.0);
        NumInstances = Math.max(Math.round(NumInstances), 1);
        return Promise.resolve({ NumInstances: NumInstances });
    };
    ImplementationBase.prototype.getInfo = function () {
        return Promise.resolve(this.Info);
    };
    return ImplementationBase;
}(events.EventEmitter));
ImplementationBase.MIN_CPUS_PER_INSTANCE = 1;
exports.ImplementationBase = ImplementationBase;
