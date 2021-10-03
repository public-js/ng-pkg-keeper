import { existsSync, readFileSync } from 'fs';
import { NgPackageJson } from '../models/ng-package-json';

import { PackageJson } from '../models/package-json';
import { TObject } from '../types/object.types';

export function getPackageJson(path: string): PackageJson | null {
    const file: TObject | null = readJsonFile(path);
    return file ? new PackageJson(file) : null;
}

export function getNgPackageJson(path: string): NgPackageJson | null {
    const file: TObject | null = readJsonFile(path);
    return file ? new NgPackageJson(file) : null;
}

export function readJsonFile(path: string): TObject | null {
    const file: string | null = existsSync(path) ? readFileSync(path, 'utf8') : null;
    return file ? JSON.parse(file) : null;
}
