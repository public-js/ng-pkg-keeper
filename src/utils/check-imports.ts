import { resolve } from 'path';

import { IObjectTypes, IPackage, TImportsReport, TTreatCallbackImport, TTreatTypes } from '../types';
import { getTreatIcon } from './get-treat-icon';

export function checkImports(
    pkg: IPackage,
    packages: IPackage[],
    treatAs: TTreatTypes | TTreatCallbackImport
): { report: TImportsReport; hasErrors: boolean; hasWarnings: boolean } {
    const tempReport = new Map<string, { data: IObjectTypes; treat: TTreatTypes }>([]);

    const selfImports: string[] = pkg.imports.importsUnique.filter((item: string) =>
        item.startsWith(pkg.name)
    );

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
            const path: string = resolve(pkg.path + '/' + item);
            if (otherPackages.some((otherPkg: string) => path.includes(otherPkg))) {
                const treat: TTreatTypes =
                    typeof treatAs === 'function' ? treatAs(pkg.name, 'relExt', item) : treatAs;
                tempReport.set(item, { data: getTreatIcon(treat) + 'External relative import', treat });
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
