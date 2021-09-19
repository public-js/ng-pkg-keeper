import { IPackage, TImportsReport, TTreatCallbackDep, TTreatTypes } from '../types';
import { getTreatIcon } from './get-treat-icon';

export function checkLocal(
    pkg: IPackage,
    treatAs: TTreatTypes | TTreatCallbackDep
): { report: TImportsReport; hasErrors: boolean; hasWarnings: boolean } {
    const pkgDeps: { [name: string]: string } = pkg.jsonData.dependencies || {};
    const pkgDevDeps: { [name: string]: string } = pkg.jsonData.devDependencies || {};
    const pkgPeerDeps: { [name: string]: string } = pkg.jsonData.peerDependencies || {};

    const allDependencies: { [name: string]: string } = { ...pkgDeps, ...pkgDevDeps, ...pkgPeerDeps };
    const packageDepsForUnused: Set<string> = new Set(Object.keys(allDependencies));
    const packageDeps: string[] = Array.from(packageDepsForUnused);

    const absoluteImports: string[] = pkg.imports.importsUnique.filter(
        (item: string) => !item.includes('./')
    );

    const tempReport = new Map<string, { data: string; treat: TTreatTypes }>([]);
    absoluteImports.forEach((item: string) => {
        const depName = packageDeps.find((dep: string) => item === dep || item.startsWith(dep + '/'));
        const subPackage = pkg.imports.subpackages.names.find((name: string) => item.includes(name));
        if (!depName && !subPackage) {
            const treat: TTreatTypes =
                typeof treatAs === 'function' ? treatAs(pkg.name, 'local', item) : treatAs;
            tempReport.set(item, { data: getTreatIcon(treat) + 'Not listed in local package.json', treat });
        } else if (depName) {
            packageDepsForUnused.delete(depName);
        }
    });

    Array.from(packageDepsForUnused)
        .filter((item: string) => item !== 'tslib')
        .forEach((item: string) => {
            const treat: TTreatTypes =
                typeof treatAs === 'function' ? treatAs(pkg.name, 'local', item) : treatAs;
            tempReport.set(item, {
                data: getTreatIcon(treat) + 'Listed in local package.json, unused',
                treat,
            });
        });

    const reportEntries = Array.from(tempReport.entries());
    const report: TImportsReport = new Map<string, string>([]);
    reportEntries.forEach(([key, item]: [string, { data: string; treat: TTreatTypes }]) => {
        report.set(key, item.data);
    });

    return {
        report,
        hasErrors: reportEntries.some(([, item]) => item.treat === 'err'),
        hasWarnings: reportEntries.some(([, item]) => item.treat === 'warn'),
    };
}
