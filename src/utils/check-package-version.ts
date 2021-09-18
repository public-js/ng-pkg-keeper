import { IPackage, IPackageJsonData, TTreatCallbackVersion, TTreatTypes } from '../types';
import { getTreatIcon } from './get-treat-icon';

export function checkPackageVersion(
    pkg: IPackage,
    rootJson: IPackageJsonData,
    treatAs: TTreatTypes | TTreatCallbackVersion
): { report: string; hasErrors: boolean; hasWarnings: boolean } {
    if (!pkg.jsonData.version) {
        const treat: TTreatTypes = typeof treatAs === 'function' ? treatAs(pkg.name) : treatAs;
        return {
            report: getTreatIcon(treat) + 'Package version is not set',
            hasErrors: treat === 'err',
            hasWarnings: treat === 'warn',
        };
    }
    if (pkg.jsonData.version !== rootJson.version) {
        const treat: TTreatTypes = typeof treatAs === 'function' ? treatAs(pkg.name) : treatAs;
        return {
            report:
                pkg.jsonData.version +
                ', ' +
                getTreatIcon(treat) +
                'does not match project version: ' +
                rootJson.version,
            hasErrors: treat === 'err',
            hasWarnings: treat === 'warn',
        };
    }
    return {
        report: pkg.jsonData.version,
        hasErrors: false,
        hasWarnings: false,
    };
}
