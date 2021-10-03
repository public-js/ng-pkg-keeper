import { Stats, statSync } from 'fs';
import { dirname, join } from 'path';

import { PackageJson } from '../models/package-json';
import { IBasePackage } from '../types/base-package.interface';
import { getAbsolutePath } from './get-absolute-path';
import { getNgPackageJson, getPackageJson } from './read-json-file';

export function resolveBasePackage(
    inputPath: string,
    isSecondary = false,
    ignoreNgPackage = false
): IBasePackage {
    const fullPath: string = getAbsolutePath(inputPath);
    const pathStats: Stats = statSync(fullPath);
    const basePath: string = pathStats.isDirectory() ? fullPath : dirname(fullPath);
    const packageJsonPath: string = join(basePath, 'package.json');
    const packageJson: PackageJson | null = getPackageJson(packageJsonPath);

    if (!packageJson && !isSecondary) {
        throw new Error(`Cannot discover package sources at ${inputPath} as 'package.json' was not found.`);
    }

    const ngPackageJson =
        packageJson?.ngPackageJson ||
        (pathStats.isDirectory() ? getNgPackageJson(join(basePath, 'ng-package.json')) : null);

    if (!ngPackageJson && !ignoreNgPackage) {
        throw new Error(`Cannot discover package sources at ${inputPath}`);
    }

    return {
        basePath,
        // packageJsonPath: packageJson ? packageJsonPath : null,
        packageJson: packageJson || null,
        ngPackageJson: ngPackageJson,
    };
}
