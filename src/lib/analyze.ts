import { Package } from './models/package';
import { IAnalyzeInput } from './types/analyze-input.interface';
import { checkLocalList, checkVersions } from './utils/check-dependencies';
import { checkImports } from './utils/check-imports';
import { checkPkgVersion } from './utils/check-pkg-version';
import { countImportsHits } from './utils/count-imports-hits';
import { getImportsFromFiles } from './utils/get-imports-from-files';
import { getImportsModelEp } from './utils/get-imports-model-ep';
import { resolveBasePackage } from './utils/resolve-base-package';
import { resolvePackage } from './utils/resolve-package';

export function analyze(params: IAnalyzeInput): Package[] {
    const requireRootJson: boolean = params.checkDeps === 'full' || Boolean(params.checkPackageVersion);
    const { basePath, packageJson } = resolveBasePackage(params.rootPath, !requireRootJson, true);
    const packages: Package[] = params.packagesPaths.map((packagePath) => resolvePackage(packagePath));

    packages.forEach((pkg) => {
        if (params.countHits || params.checkImports || params.checkDeps) {
            pkg.importsModel = getImportsFromFiles(
                pkg.packageFilesArr,
                params.matchExt || [],
                params.ignoreImports || []
            );
            pkg.secondaryEPsArr.forEach((entryPoint) => {
                entryPoint.importsModel = getImportsModelEp(pkg.importsModel, entryPoint.basePath, []);
            });
            pkg.primaryEP.importsModel = getImportsModelEp(
                pkg.importsModel,
                pkg.primaryEP.basePath,
                pkg.secondaryEPsArr.map((entryPoint) => entryPoint.basePath)
            );
        }

        if (params.countHits) {
            const hitsReport: [string, number][] = countImportsHits(
                pkg.importsModel.importsUnique,
                pkg.importsModel.importsMatched
            );
            pkg.reports.importsHits = new Map(hitsReport);
        }

        if (params.checkImports) {
            pkg.reports.importsCheck = checkImports(
                pkg,
                params.bannedImports || [],
                params.treatImports || null
            );
        }

        if (params.checkDeps === 'local') {
            pkg.reports.depsLocalCheck = checkLocalList(pkg, params.treatDeps || null);
        } else if (params.checkDeps === 'full' && packageJson?.version) {
            pkg.reports.depsLocalCheck = checkLocalList(pkg, params.treatDeps || null);
            pkg.reports.depsFullCheck = checkVersions(pkg, packageJson, params.treatDeps || null);
        }

        if (params.checkPackageVersion && packageJson?.version) {
            pkg.reports.versionCheck = checkPkgVersion(
                pkg,
                packageJson.version,
                params.treatPackageVersion || null
            );
        }
    });

    if (params.logToConsole) {
        // const replacer = (key: unknown, value: unknown) => {
        //     if (value instanceof Map) {
        //         return Array.from(value.entries());
        //     } else if (value instanceof Set) {
        //         return Array.from(value);
        //     } else {
        //         return value;
        //     }
        // };
        // console.log(JSON.stringify(packages, replacer));

        packages.forEach((pkg: Package) => {
            console.log('\n----------------------------------------------------------------------');
            console.log('Package: ' + pkg.packageName);
            console.log('Path: ' + pkg.basePath.replace(basePath, ''));
            if (params.logStats) {
                console.log('------------------------------');
                console.log('Total files    : ' + pkg.packageFilesArr.length);
                console.log('Matched files  : ' + pkg.importsModel.filesMatched.length);
                console.log('Total imports  : ' + pkg.importsModel.importsTotal);
                console.log('Matched imports: ' + pkg.importsModel.importsMatched.length);
                console.log('Unique imports : ' + pkg.importsModel.importsUnique.length);
            }
            if (params.countHits) {
                console.log('------------------------------');
                Array.from(pkg.reports.importsHits.entries()).map(([imp, hits]) => console.log(imp, '–', hits));
            }
            if (pkg.reports.hasErrors || pkg.reports.hasWarnings) {
                if (pkg.reports.versionCheck?.details) {
                    console.log('------------------------------');
                    console.log(pkg.reports.versionCheck.details);
                }
                if (pkg.reports.importsCheck) {
                    const details = pkg.reports.importsCheck.reportDetails;
                    Object.entries(details).forEach(([issue, report]) => {
                        console.log('------------------------------');
                        console.log(issue);
                        console.log(report.join('\n'));
                    });
                }
                if (pkg.reports.depsLocalCheck) {
                    const details = pkg.reports.depsLocalCheck.reportDetails;
                    Object.entries(details).forEach(([issue, report]) => {
                        console.log('------------------------------');
                        console.log(issue);
                        console.log(report.join('\n'));
                    });
                }
                if (pkg.reports.depsFullCheck) {
                    const details = pkg.reports.depsFullCheck.reportDetails;
                    Object.entries(details).forEach(([issue, report]) => {
                        console.log('------------------------------');
                        console.log(issue);
                        console.log(report.join('\n'));
                    });
                }
            }
            // console.log('----------------------------------------------------------------------');
        });
    }

    if (packages.some((pkg: Package) => pkg.reports.hasErrors)) {
        if (params.throwError && params.logToConsole) {
            throw new Error('Errors found. See the report above.');
        } else if (params.logToConsole) {
            console.error('Errors found. See the report above.');
        } else if (params.throwError) {
            throw new Error('Errors found. To see the report pass \'logToConsole\' to parameters.');
        } else {
            console.error('Errors found. To see the report pass \'logToConsole\' to parameters.');
        }
    } else if (packages.some((pkg: Package) => pkg.reports.hasWarnings)) {
        if (params.logToConsole) {
            console.warn('Warnings found. See the report above.');
        } else {
            console.warn('Warnings found. To see the report pass \'logToConsole\' to parameters.');
        }
    }

    return packages;
}
