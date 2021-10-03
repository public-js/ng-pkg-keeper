import { isAbsolute, join, normalize } from 'path';

export function resolveFilePath(filePath: string, fileDir?: string): string | null {
    const normalizedFilePath: string = normalize(filePath);
    return isAbsolute(normalizedFilePath)
        ? normalizedFilePath
        : fileDir
            ? join(normalize(fileDir), normalizedFilePath)
            : null;
}
