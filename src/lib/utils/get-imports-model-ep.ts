import { ImportsModel } from '../models/imports-model';
import { ImportsModelEp } from '../models/imports-model-ep';

export function getImportsModelEp(
    pkgImportsModel: ImportsModel,
    basePath: string,
    excludePaths: string[]
): ImportsModelEp {
    const model = new ImportsModelEp();
    const matchedFiles: string[] = pkgImportsModel.filesMatched.filter((file) => file.startsWith(basePath));
    model.files =
        excludePaths.length > 0
            ? matchedFiles.filter((file) => !excludePaths.some((path) => file.startsWith(path)))
            : matchedFiles;
    model.importsToFiles = pkgImportsModel.mapImportsToFiles(model.files);
    return model;
}
