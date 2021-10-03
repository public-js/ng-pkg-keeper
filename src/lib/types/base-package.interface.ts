import { NgPackageJson } from '../models/ng-package-json';
import { PackageJson } from '../models/package-json';

export interface IBasePackage {
    basePath: string;
    // packageJsonPath: string | null;
    packageJson: PackageJson | null;
    ngPackageJson: NgPackageJson | null;
}
