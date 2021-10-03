import { Dirent, readdirSync } from 'fs';
import { resolve } from 'path';

// export function getFilesRecursive(dirPath: string): string[] {
//     const entries = readdirSync(dirPath, { withFileTypes: true });
//     return entries
//         .map((entry: Dirent) => {
//             const res = resolve(dirPath, entry.name);
//             return entry.isDirectory() ? getFilesRecursive(res) : res;
//         })
//         .flat()
//         .sort();
// }

export function getFilesRecursive(dirPath: string): Set<string> {
    const filesSet: Set<string> = new Set<string>();
    getRecursive(dirPath, filesSet);
    return filesSet;
}

function getRecursive(dirPath: string, filesSet: Set<string>) {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    entries.forEach((entry: Dirent) => {
        const res = resolve(dirPath, entry.name);
        if (entry.isDirectory()) {
            getRecursive(res, filesSet);
        } else {
            filesSet.add(res);
        }
    });
}
