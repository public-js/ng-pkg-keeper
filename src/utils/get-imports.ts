import { readFileSync } from 'fs';
import { extname } from 'path';

import { getFiles } from './get-files';
import { IPackage, IPackageImports } from '../types';

export function getImports(pkg: IPackage, matchExt: string[], ignoreImports: string[]): IPackageImports {
    const allFiles: string[] = getFiles(pkg.path);
    const matchedFiles: string[] =
        matchExt.length > 0 ? allFiles.filter((file: string) => matchExt.includes(extname(file))) : allFiles;

    const allImports = matchedFiles
        .map((file: string) => {
            const contents = readFileSync(file, 'utf8');
            const fileLines = contents.split(/\r?\n/).filter((line: string) => line.includes(' from \''));
            return fileLines
                .map((line: string) => {
                    const match = line.match(/from '(.+?)'/);
                    return match && match.length > 1 ? match[1] : '';
                })
                .filter(Boolean);
        })
        .flat();

    const matchedImports =
        ignoreImports.length > 0
            ? allImports.filter((line: string) =>
                ignoreImports.some((ignored: string) => line.includes(ignored))
            )
            : allImports;

    const uniqueImports = [...new Set(matchedImports)].sort();

    return {
        filesTotal: allFiles.length,
        filesMatched: matchedFiles.length,
        importsTotal: allImports.length,
        importsMatched: matchedImports,
        importsUnique: uniqueImports,
    };
}
