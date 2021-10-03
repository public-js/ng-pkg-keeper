import { TObject } from '../types/object.types';
import { INgPackageJson, NgPackageJson } from './ng-package-json';

export interface IPackageJson {
    name?: string;
    version?: string;
    dependencies: TObject<string>;
    devDependencies: TObject<string>;
    peerDependencies: TObject<string>;
    ngPackage?: INgPackageJson;
}

export class PackageJson implements IPackageJson {
    name: string | undefined;
    version: string | undefined;
    dependencies: TObject<string> = {};
    devDependencies: TObject<string> = {};
    peerDependencies: TObject<string> = {};
    ngPackage: INgPackageJson | undefined;

    constructor(params: Partial<IPackageJson>) {
        Object.assign(this, params);
    }

    get ngPackageJson(): NgPackageJson | null {
        return this.ngPackage ? new NgPackageJson(this.ngPackage) : null;
    }
}
