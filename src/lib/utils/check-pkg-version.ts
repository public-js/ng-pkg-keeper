import { eq, valid } from 'semver';
import { Package } from '../models/package';
import { TIssueLevel } from '../types/issue-level.types';
import { TProcessPkgVersion } from '../types/process-pkg-version.types';
import { IReportItem } from '../types/report-item.interface';

export function checkPkgVersion(
    pkg: Package,
    rootVersion: string,
    issueLevel: TIssueLevel | TProcessPkgVersion
): IReportItem | undefined {
    const level: TIssueLevel = typeof issueLevel === 'function' ? issueLevel(pkg.packageName) : issueLevel;
    if (!level) {
        return undefined;
    }
    if (!pkg.packageJson.version) {
        return { level, details: 'No package version' };
    } else {
        if (!valid(pkg.packageJson.version)) {
            return { level, details: `Invalid package version: "${pkg.packageJson.version}"` };
        }
        if (!eq(pkg.packageJson.version, rootVersion)) {
            return {
                level,
                details: `Package version mismatch: "${pkg.packageJson.version}", root version: "${rootVersion}"`,
            };
        }
    }
    return undefined;
}
