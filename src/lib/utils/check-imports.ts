import { dirname, resolve } from 'path';
import { EntryPoint } from '../models/entry-point';
import { Package } from '../models/package';
import { ReportImports } from '../models/report-imports';
import { TIssueLevel } from '../types/issue-level.types';
import { TProcessImports } from '../types/process-imports.types';
import { IReportItem } from '../types/report-item.interface';
import { levelToIcon } from './level-to-icon';

export function checkImports(
    pkg: Package,
    bannedImports: string[],
    issueLevel: TIssueLevel | TProcessImports
): ReportImports {
    const report: ReportImports = new ReportImports();
    const entryPoints: EntryPoint[] = pkg.entryPointsArr;

    const secondaryPointIds = pkg.secondaryEPsArr.map((ep) => ep.moduleId);

    // const primaryBasePath = pkg.primaryEP.basePath;
    // const secondaryBasePaths = pkg.secondaryEPsArr.map((ep) => ep.basePath);

    entryPoints.forEach((ep: EntryPoint) => {
        checkAbsoluteSame(ep, ep.isPrimary ? secondaryPointIds : [], pkg.basePath, report, issueLevel);
        checkRelativeExt(ep, pkg.basePath, report, issueLevel);
        if (bannedImports.length > 0) {
            checkBanned(ep, bannedImports, pkg.basePath, report, issueLevel);
        }
    });

    return report;
}

function checkAbsoluteSame(
    entryPoint: EntryPoint,
    secondaryPointIds: string[],
    pkgPath: string,
    report: ReportImports,
    issueLevel: TIssueLevel | TProcessImports
): void {
    Array.from(entryPoint.importsModel.importsToFiles.entries())
        .filter(([imp]) => !imp.includes('./'))
        .forEach(([imp, files]) => {
            if (
                imp.startsWith(entryPoint.moduleId) &&
                !secondaryPointIds.some((skipped) => imp.startsWith(skipped))
            ) {
                const level: TIssueLevel =
                    typeof issueLevel === 'function'
                        ? issueLevel(entryPoint.moduleId, 'absSame', imp)
                        : issueLevel;
                if (level) {
                    report.absoluteSame.set(imp, itemFormat1(level, imp, files, pkgPath));
                }
            }
        });
}

function checkRelativeExt(
    entryPoint: EntryPoint,
    pkgPath: string,
    report: ReportImports,
    issueLevel: TIssueLevel | TProcessImports
): void {
    Array.from(entryPoint.importsModel.importsToFiles.entries())
        .filter(([imp]) => imp.includes('./'))
        .forEach(([imp, files]) => {
            if (files.some((file) => !resolve(dirname(file), imp).startsWith(entryPoint.basePath))) {
                const level: TIssueLevel =
                    typeof issueLevel === 'function'
                        ? issueLevel(entryPoint.moduleId, 'relExt', imp)
                        : issueLevel;
                if (level) {
                    report.relativeExt.set(imp, itemFormat2(level, imp, files, pkgPath, entryPoint.basePath));
                }
            }
        });
}

function checkBanned(
    entryPoint: EntryPoint,
    bannedImports: string[],
    pkgPath: string,
    report: ReportImports,
    issueLevel: TIssueLevel | TProcessImports
): void {
    Array.from(entryPoint.importsModel.importsToFiles.entries())
        .filter(([imp]) => bannedImports.some((banned) => banned.includes(imp)))
        .forEach(([imp, files]) => {
            const level: TIssueLevel =
                typeof issueLevel === 'function'
                    ? issueLevel(entryPoint.moduleId, 'banned', imp)
                    : issueLevel;
            if (level) {
                report.banned.set(imp, itemFormat3(level, imp, files, pkgPath));
            }
        });
}

function itemFormat1(level: TIssueLevel, imp: string, files: string[], pkgPath: string): IReportItem {
    const inFiles = '\n  Located in:\n   ' + files.map((file) => file.replace(pkgPath, '')).join('\n   ');
    return {
        level,
        details: levelToIcon(level) + imp + inFiles,
    };
}

function itemFormat2(
    level: TIssueLevel,
    imp: string,
    files: string[],
    pkgPath: string,
    basePath: string
): IReportItem {
    const inFiles = '\n  Located in:\n   ' + files.map((file) => file.replace(pkgPath, '')).join('\n   ');
    return {
        level,
        details: levelToIcon(level) + imp + '\n  Resolved to:' + resolve(dirname(basePath), imp) + inFiles,
    };
}

function itemFormat3(level: TIssueLevel, imp: string, files: string[], pkgPath: string): IReportItem {
    const inFiles = '\n  Located in:\n   ' + files.map((file) => file.replace(pkgPath, '')).join('\n   ');
    return {
        level,
        details: levelToIcon(level) + imp + inFiles,
    };
}
