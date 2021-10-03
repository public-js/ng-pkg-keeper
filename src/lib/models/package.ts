import { EntryPoint } from './entry-point';
import { ImportsModel } from './imports-model';
import { PackageJson } from './package-json';
import { PackageReports } from './package-reports';

export interface IPackage {
    packageName: string;
    basePath: string;
    packageJson: PackageJson;
    packageFiles?: Set<string>;
}

export class Package implements IPackage {
    packageName = '';
    basePath = '';
    packageJson!: PackageJson;
    packageFiles: Set<string> = new Set<string>();
    importsModel: ImportsModel = new ImportsModel();
    primaryEP!: EntryPoint;
    secondaryEPs: Map<string, EntryPoint> = new Map<string, EntryPoint>();
    reports: PackageReports = new PackageReports();

    private entryPointIds: Set<string> = new Set<string>();

    constructor(params: IPackage) {
        Object.assign(this, params);
    }

    get packageFilesArr(): string[] {
        return Array.from(this.packageFiles);
    }

    get entryPointsArr(): EntryPoint[] {
        return [this.primaryEP, ...this.secondaryEPs.values()].filter(Boolean);
    }

    get entryPointIdsArr(): string[] {
        return Array.from(this.entryPointIds);
    }

    get secondaryEPsArr(): EntryPoint[] {
        return Array.from(this.secondaryEPs.values());
    }

    set primaryEntryPoint(item: EntryPoint) {
        this.primaryEP = item;
        this.entryPointIds.add(item.moduleId);
    }

    set secondaryEntryPoint(item: EntryPoint) {
        this.secondaryEPs.set(item.moduleId, item);
        this.entryPointIds.add(item.moduleId);
    }
}
