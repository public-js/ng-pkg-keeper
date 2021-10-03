import { posix, win32 } from 'path';

const pathRegExp = new RegExp('\\' + win32.sep, 'g');
const isWin32: boolean = process.platform === 'win32';

const ensureUnixPathCache: Map<string, string> = new Map<string, string>();

export function ensureUnixPath(path: string): string {
    if (!isWin32) {
        return path;
    }
    const cachedPath = ensureUnixPathCache.get(path);
    if (cachedPath) {
        return cachedPath;
    }
    // we use a regex instead of the character literal due to a bug in some versions of node.js
    // the path separator needs to be preceded by an escape character
    const normalizedPath = path.replace(pathRegExp, posix.sep);
    ensureUnixPathCache.set(path, normalizedPath);
    return normalizedPath;
}
