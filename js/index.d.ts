/// <reference types="node" />
/// <reference types="es6-promise" />
import { WorkerKey, IWorkersLaunchRequest, IWorker, IAutoScalableState, AutoScalerImplementationInfo } from 'autoscalable-grid';
import * as events from "events";
export declare type ConvertToWorkerKeyProc = (worker: IWorker) => WorkerKey;
export interface Options {
    Name?: string;
    CPUsPerInstance?: number;
}
export declare class ImplementationBase extends events.EventEmitter {
    private workerToKey;
    private __Name;
    private __CPUsPerInstance;
    static MIN_CPUS_PER_INSTANCE: number;
    constructor(workerToKey: ConvertToWorkerKeyProc, options?: Options);
    protected boundValue(value: number, min: number, max?: number): number;
    CPUsPerInstance: number;
    readonly Name: string;
    TranslateToWorkerKeys(workers: IWorker[]): Promise<WorkerKey[]>;
    EstimateWorkersLaunchRequest(state: IAutoScalableState): Promise<IWorkersLaunchRequest>;
    getInfo(): Promise<AutoScalerImplementationInfo>;
}
