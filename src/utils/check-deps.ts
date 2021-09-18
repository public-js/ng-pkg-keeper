import { IPackage, TImportsReport, TTreatCallbackDep, TTreatTypes } from '../types';
import { getTreatIcon } from './get-treat-icon';

export function checkLocal(
    pkg: IPackage,
    treatAs: TTreatTypes | TTreatCallbackDep
): { report: TImportsReport; hasErrors: boolean; hasWarnings: boolean } {
    const allDependencies: { [name: string]: string } = {
        ...(pkg.jsonData.dependencies || {}),
        ...(pkg.jsonData.devDependencies || {}),
        ...(pkg.jsonData.peerDependencies || {}),
    };
    const packageDeps: string[] = Array.from(new Set(Object.keys(allDependencies)));

    const absoluteImports: string[] = pkg.imports.importsUnique.filter(
        (item: string) => !item.includes('./')
    );

    const tempReport = new Map<string, { data: string; treat: TTreatTypes }>([]);
    absoluteImports.forEach((item: string) => {
        if (!packageDeps.some((dep: string) => item.startsWith(dep))) {
            const treat: TTreatTypes =
                typeof treatAs === 'function' ? treatAs(pkg.name, 'local', item) : treatAs;
            tempReport.set(item, { data: getTreatIcon(treat) + 'Not listed in local package.json', treat });
        }
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
