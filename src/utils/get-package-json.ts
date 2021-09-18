import { readFileSync } from 'fs';

import { IPackageJsonData } from '../types';

export function getPackageJson(path: string): IPackageJsonData {
    return JSON.parse(readFileSync(path, 'utf8'));
}
