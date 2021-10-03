import { ImportsModelEp } from './imports-model-ep';
import { NgPackageJson } from './ng-package-json';

export interface IEntryPoint {
    basePath: string;
    moduleId: string;
    isPrimary: boolean;
    ngPackageJson: NgPackageJson | null;
}

export class EntryPoint implements IEntryPoint {
    basePath = '';
    moduleId = '';
    isPrimary = true;
    ngPackageJson: NgPackageJson | null = null;

    importsModel: ImportsModelEp = new ImportsModelEp();

    constructor(params: IEntryPoint) {
        Object.assign(this, params);
    }
}
