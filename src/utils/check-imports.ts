import { dirname, resolve } from 'path';

import { IObjectTypes, IPackage, TImportsReport, TTreatCallbackImport, TTreatTypes } from '../types';
import { getTreatIcon } from './get-treat-icon';

export function checkImports(
    pkg: IPackage,
    packages: IPackage[],
    bannedImports: string[],
    treatAs: TTreatTypes | TTreatCallbackImport
): { report: TImportsReport; hasErrors: boolean; hasWarnings: boolean } {
    const tempReport = new Map<string, { data: IObjectTypes; treat: TTreatTypes }>([]);

    const selfImports: string[] = pkg.imports.importsUnique
        .filter((item: string) => item.startsWith(pkg.name))
        .filter((item: string) => {
            if (pkg.imports.subpackages.paths.length === 0) {
                return true;
            }

            const subName = pkg.imports.subpackages.names.find((name) => item.startsWith(name));
            if (!subName) {
                return false;
            }
            const subPath = pkg.imports.subpackages.nameToPath.get(subName);
            const filesWithImport = pkg.imports.matchedMap.get(item) || [];
            if (!subPath) {
                return false;
            }
            return filesWithImport.some((filePath: string) => filePath.startsWith(subPath));
        });

    selfImports.forEach((item: string) => {
        const treat: TTreatTypes =
            typeof treatAs === 'function' ? treatAs(pkg.name, 'absSame', item) : treatAs;
        tempReport.set(item, { data: getTreatIcon(treat) + 'Absolute import from the same package', treat });
    });

    const relativeImports: string[] = pkg.imports.importsUnique.filter((item: string) =>
        item.includes('../')
    );

    if (relativeImports.length > 0) {
        const otherPackages: string[] = packages
            .map((pkg: IPackage) => pkg.path)
            .filter((path: string) => path !== pkg.path);

        relativeImports.forEach((item: string) => {
            const filesWithImport = pkg.imports.matchedMap.get(item) || [];
            filesWithImport.forEach((file: string) => {
                const importFrom: string = resolve(dirname(file), item);
                const otherSubpackages: string[] = pkg.imports.subpackages.paths.filter(
                    (subPath: string) => !file.includes(subPath)
                );
                if (
                    [...otherPackages, ...otherSubpackages].some((otherPkg: string) =>
                        importFrom.includes(otherPkg)
                    )
                ) {
                    const treat: TTreatTypes =
                        typeof treatAs === 'function' ? treatAs(pkg.name, 'relExt', item) : treatAs;
                    tempReport.set(item, { data: getTreatIcon(treat) + 'External relative import', treat });
                }
            });
        });
    }

    if (bannedImports.length > 0) {
        pkg.imports.importsUnique.forEach((item: string) => {
            if (bannedImports.some((banned: string) => item.includes(banned))) {
                const treat: TTreatTypes =
                    typeof treatAs === 'function' ? treatAs(pkg.name, 'banned', item) : treatAs;
                tempReport.set(item, { data: getTreatIcon(treat) + 'Banned import', treat });
            }
        });
    }

    const reportEntries = Array.from(tempReport.entries());
    const report: TImportsReport = new Map<string, IObjectTypes>([]);
    reportEntries.forEach(([key, item]: [string, { data: IObjectTypes; treat: TTreatTypes }]) => {
        report.set(key, item.data);
    });

    return {
        report,
        hasErrors: reportEntries.some(([, item]) => item.treat === 'err'),
        hasWarnings: reportEntries.some(([, item]) => item.treat === 'warn'),
    };
}
