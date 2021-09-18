import { Dirent, readdirSync } from 'fs';
import { resolve } from 'path';

export function getFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries
        .map((entry: Dirent) => {
            const res = resolve(dir, entry.name);
            return entry.isDirectory() ? getFiles(res) : res;
        })
        .flat();
}
