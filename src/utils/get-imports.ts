import { readFileSync } from 'fs';
import { basename, dirname, extname } from 'path';

import { IPackage, IPackageImports } from '../types';
import { getFiles } from './get-files';
import { getPackageJson } from './get-package-json';

export function getImports(pkg: IPackage, matchExt: string[], ignoreImports: string[]): IPackageImports {
    const allFiles: string[] = getFiles(pkg.path);
    const matchedFiles: string[] =
        matchExt.length > 0 ? allFiles.filter((file: string) => matchExt.includes(extname(file))) : allFiles;

    /** file, imports */
    const allImports = new Map<string, string[]>([]);
    matchedFiles.forEach((file: string) => {
        const contents = readFileSync(file, 'utf8');
        const fileLines = contents.split(/\r?\n/).filter((line: string) => line.includes(' from \''));
        const imports = fileLines
            .map((line: string) => {
                const match = line.match(/from '(.+?)'/);
                return match && match.length > 1 ? match[1] : '';
            })
            .filter(Boolean);
        allImports.set(file, imports);
    });

    /** file, imports */
    const matchedRev =
        ignoreImports.length > 0 ? new Map<string, string[]>([]) : new Map(allImports.entries());
    if (ignoreImports.length > 0) {
        Array.from(allImports.entries()).forEach(([file, imports]: [string, string[]]) => {
            const matched = imports.filter((line: string) =>
                ignoreImports.some((ignored: string) => line.includes(ignored))
            );
            if (matched.length > 0) {
                matchedRev.set(file, matched);
            }
        });
    }

    const matchedImports = Array.from(matchedRev.values()).flat();
    const uniqueImports = [...new Set(matchedImports)].sort();

    const revEntries = Array.from(matchedRev.entries());
    /** import, files */
    const matchedMap = new Map<string, string[]>([]);
    uniqueImports.forEach((item: string) => {
        const files = revEntries
            .filter(([, imports]: [string, string[]]) => imports.includes(item))
            .map(([file]: [string, string[]]) => file);
        matchedMap.set(item, files);
    });

    const packageJsonFiles = allFiles.filter((file: string) => basename(file) === 'package.json');
    const subNames: string[] = [];
    const nameToPath = new Map<string, string>([]);
    const pathToName = new Map<string, string>([]);
    const subPaths: string[] = packageJsonFiles
        .filter((path: string) => Boolean(getPackageJson(path).ngPackage))
        .map((path: string) => dirname(path));
    subPaths.forEach((path: string) => {
        const subName = pkg.name + path.replace(pkg.path, '');
        subNames.push(subName);
        nameToPath.set(subName, path);
        pathToName.set(path, subName);
    });

    return {
        filesTotal: allFiles.length,
        filesMatched: matchedFiles.length,
        importsTotal: Array.from(allImports.values()).flat().length,
        importsMatched: matchedImports,
        importsUnique: uniqueImports,
        matchedMap: matchedMap,
        packageJsonFiles: allFiles.filter((file: string) => basename(file) === 'package.json'),
        subpackages: {
            names: subNames,
            paths: subPaths,
            nameToPath,
            pathToName,
        },
    };
}
