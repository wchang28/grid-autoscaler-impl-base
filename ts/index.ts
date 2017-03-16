import {WorkerKey, IWorkersLaunchRequest, IWorker, IAutoScalableState, AutoScalerImplementationInfo} from 'autoscalable-grid';
import * as events from "events";
import * as _ from 'lodash';

export type ConvertToWorkerKeyProc = (worker: IWorker) => WorkerKey;

export interface Options {
    Name?: string;
    CPUsPerInstance?: number;
}

let defaultOptions: Options = {
    Name: "(Implementation)"
    ,CPUsPerInstance: 1
}

export class ImplementationBase extends events.EventEmitter {
    private __Name: string;
    private __CPUsPerInstance: number;
    public static MIN_CPUS_PER_INSTANCE = 1;
    constructor(private workerToKey: ConvertToWorkerKeyProc, options?: Options) {
        super();
        options = options || defaultOptions;
        options = _.assignIn({}, defaultOptions, options);
        this.__Name = options.Name;
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
    get Name() : string {return this.__Name;}

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
        return Promise.resolve<AutoScalerImplementationInfo>({Name: this.Name});
    }
}