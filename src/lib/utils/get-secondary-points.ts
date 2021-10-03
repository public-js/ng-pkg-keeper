import { basename, dirname } from 'path';

export function getSecondaryPoints(basePath: string, packageFiles: string[]): string[] {
    const directories: string[] = packageFiles
        .filter((filePath) => {
            const baseName = basename(filePath);
            return baseName === 'package.json' || baseName === 'ng-package.json';
        })
        .map((filePath) => dirname(filePath))
        .filter((dirPath) => dirPath !== basePath);
    return Array.from(new Set(directories)).sort();
}
