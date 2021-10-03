export interface IImportsModelEp {
    files: string[];
    importsToFiles: Map<string, string[]>;
}

export class ImportsModelEp implements IImportsModelEp {
    files: string[] = [];
    importsToFiles: Map<string, string[]> = new Map<string, string[]>();
}
