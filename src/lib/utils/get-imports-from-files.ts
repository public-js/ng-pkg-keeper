import { readFileSync } from 'fs';
import { extname } from 'path';

import { ImportsModel } from '../models/imports-model';

export function getImportsFromFiles(
    packageFiles: string[],
    matchExtensions: string[],
    ignoreImports: string[]
): ImportsModel {
    const model = new ImportsModel();

    model.filesMatched =
        matchExtensions.length > 0
            ? packageFiles.filter((file: string) => matchExtensions.includes(extname(file)))
            : [...packageFiles];

    const filesToImportsRaw = new Map<string, string[]>();
    model.filesMatched.forEach((file: string) => {
        const contents = readFileSync(file, 'utf8');
        const fileLines = contents.split(/\r?\n/).filter((line: string) => line.includes('from'));
        const imports = fileLines
            .map((line: string) => {
                const match = line.match(/\s+?from\s+?['"](.+?)['"]/);
                return match && match.length > 1 ? match[1] : '';
            })
            .filter(Boolean);
        filesToImportsRaw.set(file, imports);
    });
    model.importsTotal = Array.from(filesToImportsRaw.values()).flat().length;

    const filesToImports = ignoreImports.length > 0 ? new Map<string, string[]>([]) : filesToImportsRaw;
    if (ignoreImports.length > 0) {
        Array.from(filesToImportsRaw.entries()).forEach(([file, imports]: [string, string[]]) => {
            const matched = imports.filter(
                (line: string) => !ignoreImports.some((ignored: string) => line.includes(ignored))
            );
            if (matched.length > 0) {
                filesToImports.set(file, matched);
            }
        });
    }
    model.filesToImports = filesToImports;
    model.importsMatched = Array.from(filesToImports.values()).flat();
    model.importsUnique = [...new Set(model.importsMatched)].sort();

    return model;
}
