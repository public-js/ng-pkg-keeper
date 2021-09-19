import { existsSync } from 'fs';
import { resolve } from 'path';

import {
    IAnalyzeInput,
    IObject,
    IObjectTypes,
    IPackage,
    IPackageInput,
    IPackageJsonData,
    packageImportsDefault,
} from './types';
import { checkLocal } from './utils/check-deps';
import { checkImports } from './utils/check-imports';
import { checkPackageVersion } from './utils/check-package-version';
import { countImportHits } from './utils/count-import-hits';
import { getImports } from './utils/get-imports';
import { getPackageJson } from './utils/get-package-json';

/**
 * Run the packages analysis
 * @param {IAnalyzeInput} params - Analysis configuration
 * @returns {IPackage[]}
 */
export function analyze(params: IAnalyzeInput): IPackage[] {
    const timeStart = Date.now();
    analysisPreChecks(params);

    const rootJson: IPackageJsonData =
        params.packageJson && (params.checkDeps === 'full' || params.checkPackageVersion)
            ? getPackageJson(params.packageJson)
            : {};

    const packages: IPackage[] = [];
    params.packages.forEach((pkgIn: IPackageInput) => {
        const start = Date.now();
        const packageJson = packagePreChecks(pkgIn);
        packages.push({
            name: pkgIn.name,
            path: pkgIn.path,
            packageJson,
            jsonData: {},
            imports: packageImportsDefault,
            importsReport: new Map<string, IObject>([]),
            versionReport: '',
            time: Date.now() - start,
        });
    });

    packages.forEach((pkg: IPackage) => {
        const start = Date.now();

        if (params.checkDeps === 'full' || params.checkPackageVersion) {
            pkg.jsonData = getPackageJson(pkg.packageJson);
        }
        if (params.countHits || params.checkImports || params.checkDeps) {
            pkg.imports = getImports(pkg, params.matchExt || [], params.ignoreImports || []);
            pkg.imports.importsUnique.forEach((item: string) => {
                pkg.importsReport.set(item, {});
            });
        }

        if (params.countHits) {
            const data = countImportHits(pkg.imports);
            Array.from(data.entries()).forEach(([key, report]: [string, IObjectTypes]) => {
                const item = pkg.importsReport.get(key) || {};
                item.Hits = report;
                pkg.importsReport.set(key, item);
            });
        }

        if (params.checkImports) {
            const {
                report: data,
                hasErrors,
                hasWarnings,
            } = checkImports(pkg, packages, params.bannedImports || [], params.treatImports || null);
            Array.from(data.entries()).forEach(([key, report]: [string, IObjectTypes]) => {
                const item = pkg.importsReport.get(key) || {};
                item.Imports = report;
                pkg.importsReport.set(key, item);
            });
            if (hasErrors) {
                pkg.hasErrors = true;
            }
            if (hasWarnings) {
                pkg.hasWarnings = true;
            }
        }

        if (params.checkDeps) {
            const { report: data, hasErrors, hasWarnings } = checkLocal(pkg, params.treatDeps || null);
            Array.from(data.entries()).forEach(([key, report]: [string, IObjectTypes]) => {
                const item = pkg.importsReport.get(key) || {};
                item.Dependencies = report;
                pkg.importsReport.set(key, item);
            });
            if (hasErrors) {
                pkg.hasErrors = true;
            }
            if (hasWarnings) {
                pkg.hasWarnings = true;
            }
        }

        if (params.checkPackageVersion) {
            const {
                report: data,
                hasErrors,
                hasWarnings,
            } = checkPackageVersion(pkg, rootJson, params.treatPackageVersion || null);
            pkg.versionReport = data;
            if (hasErrors) {
                pkg.hasErrors = true;
            }
            if (hasWarnings) {
                pkg.hasWarnings = true;
            }
        }

        if (params.logToConsole) {
            packageReportLog(pkg, params, start);
        }
    });

    if (params.logToConsole) {
        const totalReport: IObject = {
            'Packages analyzed': packages.length,
            'Total time spent (s)': (Date.now() - timeStart) / 1000,
        };
        console.table(totalReport);
    }

    if (packages.some((pkg: IPackage) => pkg.hasErrors)) {
        if (params.throwError && params.logToConsole) {
            throw new Error('Errors found. See the report above.');
        } else if (params.logToConsole) {
            console.error('Errors found. See the report above.');
        } else if (params.throwError) {
            throw new Error('Errors found. To see the report pass \'logToConsole\' to parameters.');
        } else {
            console.error('Errors found. To see the report pass \'logToConsole\' to parameters.');
        }
    } else if (packages.some((pkg: IPackage) => pkg.hasWarnings)) {
        if (params.logToConsole) {
            console.warn('Warnings found. See the report above.');
        } else {
            console.warn('Warnings found. To see the report pass \'logToConsole\' to parameters.');
        }
    }

    return packages;
}

function analysisPreChecks(params: IAnalyzeInput): void {
    if (params.packageJson && !existsSync(params.packageJson)) {
        throw new Error(`The provided package.json path (${params.packageJson}) does not exist`);
    }
    if (params.checkDeps === 'full' && !params.packageJson) {
        throw new Error('Can not fully check dependencies without package.json');
    }
    if (params.checkPackageVersion && !params.packageJson) {
        throw new Error('Can not check versions without package.json');
    }
}

function packagePreChecks(pkgIn: IPackageInput): string {
    if (!existsSync(pkgIn.path)) {
        throw new Error('The provided package path does not exist: ' + pkgIn.path);
    }
    const packageJson = pkgIn?.packageJson || resolve(pkgIn.path + '/package.json');
    if (!existsSync(packageJson)) {
        throw new Error('The provided package.json path does not exist: ' + packageJson);
    }
    return packageJson;
}

function packageReportLog(pkg: IPackage, params: IAnalyzeInput, timeStart: number): void {
    const packageReport: IObject = {
        Package: pkg.name,
        Path: pkg.path,
        'Version info': pkg.versionReport,
    };
    if (params.countHits || params.checkImports || params.checkDeps) {
        packageReport['Total files'] = pkg.imports.filesTotal;
        packageReport['Matched files'] = pkg.imports.filesMatched;
        packageReport['Total imports'] = pkg.imports.importsTotal;
        packageReport['Matched imports'] = pkg.imports.importsMatched.length;
        packageReport['Unique imports'] = pkg.imports.importsUnique.length;
    }
    const importsReport: IObject<IObjectTypes | IObject> = {};
    if (pkg.importsReport.size > 0) {
        Array.from(pkg.importsReport.entries())
            .filter(([, reports]: [string, IObject]) => Object.keys(reports).length > 0)
            .forEach(([key, reports]: [string, IObject]) => {
                importsReport[key] = reports;
            });
    }

    pkg.time += Date.now() - timeStart;
    packageReport['Time spent (s)'] = pkg.time / 1000;

    console.group();
    console.table(packageReport);
    if (Object.keys(importsReport).length > 0) {
        console.table(importsReport);
    }
    console.groupEnd();
}
