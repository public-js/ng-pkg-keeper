import { relative } from 'path';

import { EntryPoint } from '../models/entry-point';
import { Package } from '../models/package';
import { IBasePackage } from '../types/base-package.interface';
import { ensureUnixPath } from './ensure-unix-path';
import { getAbsolutePath } from './get-absolute-path';
import { getFilesRecursive } from './get-files-recursive';
import { getSecondaryPoints } from './get-secondary-points';
import { resolveBasePackage } from './resolve-base-package';

export function resolvePackage(inputPath: string): Package {
    const fullPath: string = getAbsolutePath(inputPath);

    const primaryPackage: IBasePackage = resolveBasePackage(fullPath);
    const primaryEP: EntryPoint = new EntryPoint({
        basePath: primaryPackage.basePath,
        moduleId: primaryPackage.packageJson?.name || '',
        isPrimary: true,
        ngPackageJson: primaryPackage.ngPackageJson,
    });

    const pkg: Package = new Package({
        packageName: primaryEP.moduleId,
        basePath: primaryPackage.basePath,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        packageJson: primaryPackage.packageJson!,
        packageFiles: getFilesRecursive(primaryEP.basePath),
    });
    pkg.primaryEntryPoint = primaryEP;

    const secondaryPaths: string[] = getSecondaryPoints(primaryEP.basePath, pkg.packageFilesArr);
    secondaryPaths.forEach((secondaryPath) => {
        const basePackage: IBasePackage = resolveBasePackage(secondaryPath, true);
        const relativeSourcePath = relative(primaryEP.basePath, basePackage.basePath);
        pkg.secondaryEntryPoint = new EntryPoint({
            basePath: basePackage.basePath,
            moduleId: ensureUnixPath(`${primaryEP.moduleId}/${relativeSourcePath}`),
            isPrimary: false,
            ngPackageJson: basePackage.ngPackageJson,
        });
    });

    return pkg;
}
