export interface IImportsModel {
    filesMatched: string[];
    importsTotal: number;
    importsMatched: string[];
    importsUnique: string[];
    // filesToImports: Map<string, string[]>;
    // importsToFiles: Map<string, string[]>;
}

export class ImportsModel implements IImportsModel {
    filesMatched: string[] = [];
    importsTotal = 0;
    importsMatched: string[] = [];
    importsUnique: string[] = [];

    private _filesToImports: Map<string, string[]> = new Map<string, string[]>();
    private _filesToImportsEnt: Array<[string, string[]]> = [];
    // importsToFiles: Map<string, string[]> = new Map<string, string[]>();

    get filesToImports(): Map<string, string[]> {
        return this._filesToImports;
    }

    set filesToImports(data: Map<string, string[]>) {
        this._filesToImports = data;
        this._filesToImportsEnt = Array.from(data.entries());
    }

    get filesToImportsEnt(): Array<[string, string[]]> {
        return this._filesToImportsEnt;
    }

    mapImportsToFiles(files: string[]): Map<string, string[]> {
        const importsToFiles: Map<string, string[]> = new Map<string, string[]>();
        const ftiEntries: Array<[string, string[]]> = this._filesToImportsEnt.filter(
            ([file]: [string, unknown]) => files.includes(file)
        );
        this.importsUnique.forEach((item: string) => {
            const files = ftiEntries
                .filter(([, imports]: [unknown, string[]]) => imports.includes(item))
                .map(([file]: [string, unknown]) => file);
            if (files.length > 0) {
                importsToFiles.set(item, files);
            }
        });
        return importsToFiles;
    }
}
