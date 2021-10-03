import { eq, intersects, satisfies, valid, validRange } from 'semver';
import { Package } from '../models/package';
import { PackageJson } from '../models/package-json';
import { ReportDepsFull } from '../models/report-deps-full';
import { ReportDepsLocal } from '../models/report-deps-local';
import { TIssueLevel } from '../types/issue-level.types';
import { TObject } from '../types/object.types';
import { TProcessDeps } from '../types/process-dependencies.types';
import { IReportItem } from '../types/report-item.interface';
import { levelToIcon } from './level-to-icon';

export function checkLocalList(pkg: Package, issueLevel: TIssueLevel | TProcessDeps): ReportDepsLocal {
    const report: ReportDepsLocal = new ReportDepsLocal();

    const allDependencies: TObject<string> = {
        ...(pkg.packageJson.peerDependencies || {}),
        ...(pkg.packageJson.devDependencies || {}),
        ...(pkg.packageJson.dependencies || {}),
    };
    const packageDepsForUnused: Set<string> = new Set(Object.keys(allDependencies));
    const packageDeps: string[] = Array.from(packageDepsForUnused);

    const absoluteImports = pkg.importsModel.importsUnique.filter(
        (imp) => !imp.includes('./') && !imp.startsWith(pkg.packageName)
    );

    absoluteImports.forEach((item: string) => {
        const depName = packageDeps.find((dep: string) => item === dep || item.startsWith(dep + '/'));
        const isSamePackage = depName ? depName.includes(pkg.packageName) : false;
        if (!depName && !isSamePackage) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eLocalNotListed', item)
                    : issueLevel;
            if (level) {
                report.eLocalNotListed.set(item, itemFormat1(level, item));
            }
        } else if (depName) {
            packageDepsForUnused.delete(depName);
        }
    });

    Array.from(packageDepsForUnused)
        .filter((item: string) => item !== 'tslib')
        .forEach((item: string) => {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eLocalUnused', item)
                    : issueLevel;
            if (level) {
                report.eLocalUnused.set(item, itemFormat1(level, item));
            }
        });

    return report;
}

export function checkVersions(
    pkg: Package,
    rootJson: PackageJson,
    issueLevel: TIssueLevel | TProcessDeps
): ReportDepsFull {
    const report: ReportDepsFull = new ReportDepsFull();

    const pkgDeps: TObject<string> = pkg.packageJson.dependencies || {};
    const pkgDevDeps: TObject<string> = pkg.packageJson.devDependencies || {};
    const pkgPeerDeps: TObject<string> = pkg.packageJson.peerDependencies || {};

    const rootDeps: TObject<string> = rootJson.dependencies || {};
    const rootDevDeps: TObject<string> = rootJson.devDependencies || {};
    const rootPeerDeps: TObject<string> = rootJson.peerDependencies || {};

    Array.from(Object.entries(pkgDeps)).forEach(([depName, depVer]) => {
        if (!rootDeps[depName]) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eRootNotListedDep', depName)
                    : issueLevel;
            if (level) {
                report.eRootNotListedDep.set(depName, itemFormat2(level, depName, depVer));
            }
            return;
        }
        validateDepVersion(pkg.packageName, depName, depVer, rootDeps[depName], report, issueLevel);
    });

    Array.from(Object.entries(pkgDevDeps)).forEach(([depName, depVer]) => {
        if (!rootDevDeps[depName] && !rootDeps[depName]) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eRootNotListedDevDep', depName)
                    : issueLevel;
            if (level) {
                report.eRootNotListedDevDep.set(depName, itemFormat2(level, depName, depVer));
            }
            return;
        }
        if (!rootDevDeps[depName] && rootDeps[depName]) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eRootMismatchDevDep', depName)
                    : issueLevel;
            if (level) {
                report.eRootMismatchDevDep.set(depName, itemFormat2(level, depName, depVer));
            }
        }
        validateDepVersion(
            pkg.packageName,
            depName,
            depVer,
            rootDevDeps[depName] || rootDeps[depName],
            report,
            issueLevel
        );
    });

    Array.from(Object.entries(pkgPeerDeps)).forEach(([depName, depVer]) => {
        if (!rootPeerDeps[depName] && !rootDeps[depName]) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkg.packageName, 'eRootNotListedPeerDep', depName)
                    : issueLevel;
            if (level) {
                report.eRootNotListedPeerDep.set(depName, itemFormat2(level, depName, depVer));
            }
            return;
        }
        validateDepVersion(
            pkg.packageName,
            depName,
            depVer,
            rootPeerDeps[depName] || rootDeps[depName],
            report,
            issueLevel
        );
    });

    return report;
}

function validateDepVersion(
    pkgName: string,
    depName: string,
    depVer: string,
    rootDepVer: string,
    report: ReportDepsFull,
    issueLevel: TIssueLevel | TProcessDeps
) {
    const [rootIsVer, rootIsRange] = [valid(rootDepVer), validRange(rootDepVer)];
    if (!rootIsVer && !rootIsRange) {
        if (rootDepVer.includes('file:')) {
            return;
        }
        const level: TIssueLevel =
            typeof issueLevel === 'function' ? issueLevel(pkgName, 'eRootVerInvalid', depName) : issueLevel;
        if (level) {
            report.eRootVerInvalid.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
        }
        return;
    }
    const [localIsVer, localIsRange] = [valid(depVer), validRange(depVer)];
    if (!localIsVer && !localIsRange) {
        const level: TIssueLevel =
            typeof issueLevel === 'function' ? issueLevel(pkgName, 'eLocalVerInvalid', depName) : issueLevel;
        if (level) {
            report.eLocalVerInvalid.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
        }
        return;
    }
    if (localIsVer && rootIsVer) {
        if (!eq(depVer, rootDepVer)) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkgName, 'eLocalVMismatchRootV', depName)
                    : issueLevel;
            if (level) {
                report.eLocalVMismatchRootV.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
            }
            return;
        }
    } else if (localIsVer && rootIsRange) {
        if (!satisfies(depVer, rootDepVer)) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkgName, 'eLocalVMismatchRootR', depName)
                    : issueLevel;
            if (level) {
                report.eLocalVMismatchRootR.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
            }
            return;
        }
    } else if (localIsRange && rootIsVer) {
        if (!satisfies(rootDepVer, depVer)) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkgName, 'eLocalRMismatchRootV', depName)
                    : issueLevel;
            if (level) {
                report.eLocalRMismatchRootV.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
            }
            return;
        }
    } else {
        if (!intersects(depVer, rootDepVer)) {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(pkgName, 'eLocalRMismatchRootR', depName)
                    : issueLevel;
            if (level) {
                report.eLocalRMismatchRootR.set(depName, itemFormat3(level, depName, depVer, rootDepVer));
            }
            return;
        }
    }
}

function itemFormat1(level: TIssueLevel, item: string): IReportItem {
    return {
        level,
        details: levelToIcon(level) + item,
    };
}

function itemFormat2(level: TIssueLevel, depName: string, depVer: string): IReportItem {
    return {
        level,
        details: levelToIcon(level) + `${depName}, version: "${depVer}"`,
    };
}

function itemFormat3(level: TIssueLevel, depName: string, depVer: string, rootDepVer: string): IReportItem {
    return {
        level,
        details: levelToIcon(level) + `${depName}, version: "${depVer}", root version: "${rootDepVer}"`,
    };
}
