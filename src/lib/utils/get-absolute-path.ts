import { isAbsolute, normalize, resolve } from 'path';

export function getAbsolutePath(path: string): string {
    return isAbsolute(path) ? normalize(path) : resolve(path);
}
