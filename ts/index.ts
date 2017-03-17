import {WorkerKey, IWorkersLaunchRequest, IWorker, IAutoScalableState, AutoScalerImplementationInfo} from 'autoscalable-grid';
import * as events from "events";
import * as _ from 'lodash';

export type ConvertToWorkerKeyProc = (worker: IWorker) => WorkerKey;

export interface Options {
    CPUsPerInstance?: number;
}

let defaultInfo: AutoScalerImplementationInfo = {
    Name: "(Implementation)"
    ,HasSetupUI: false
}

let defaultOptions: Options = {
    CPUsPerInstance: 1
}

export class ImplementationBase extends events.EventEmitter {
    private __Info: AutoScalerImplementationInfo;
    private __CPUsPerInstance: number;
    public static MIN_CPUS_PER_INSTANCE = 1;
    constructor(info: AutoScalerImplementationInfo, private workerToKey: ConvertToWorkerKeyProc, options?: Options) {
        super();
        options = options || defaultOptions;
        options = _.assignIn({}, defaultOptions, options);
        info = info || defaultInfo
        info = _.assignIn({}, defaultInfo, info);
        this.__Info = info;
        this.__CPUsPerInstance = Math.round(this.boundValue(options.CPUsPerInstance, ImplementationBase.MIN_CPUS_PER_INSTANCE));
    }
    // set min/max bound on value
    protected boundValue(value: number, min: number, max?: number) : number {
        value = Math.max(value, min);
        return (typeof max === "number" ? Math.min(value, max) : value);
    }

    get CPUsPerInstance() : number {return this.__CPUsPerInstance;}
    set CPUsPerInstance(newValue: number) {
        if (typeof newValue === 'number') {
            newValue = Math.round(this.boundValue(newValue, ImplementationBase.MIN_CPUS_PER_INSTANCE));
            if (newValue !== this.__CPUsPerInstance) {
                this.__CPUsPerInstance = newValue;
                this.emit('change');
            }
        }
    }
    get Info() : AutoScalerImplementationInfo {return this.__Info;}

    TranslateToWorkerKeys(workers: IWorker[]): Promise<WorkerKey[]> {
        let workerKeys: WorkerKey[] = []; 
        for (let i in workers) {
            let worker = workers[i];
            workerKeys.push(this.workerToKey(worker));
        }
        return Promise.resolve<WorkerKey[]>(workerKeys);
    }
    EstimateWorkersLaunchRequest(state: IAutoScalableState): Promise<IWorkersLaunchRequest> {
        let NumInstances = (state.CPUDebt * 1.0)/(this.CPUsPerInstance * 1.0);
        NumInstances = Math.max(Math.round(NumInstances), 1);
        return Promise.resolve<IWorkersLaunchRequest>({NumInstances});
    }
    getInfo() : Promise<AutoScalerImplementationInfo> {
        return Promise.resolve<AutoScalerImplementationInfo>(this.Info);
    }
}

export interface ImplementationSetup {
    getCPUsPerInstance: () => Promise<number>;
    setCPUsPerInstance: (value: number) => Promise<number>;
}