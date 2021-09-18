export interface IPackageInput {
    name: string;
    path: string;
    packageJson?: string;
}

export interface IPackage extends IPackageInput {
    packageJson: string;
    jsonData: IPackageJsonData;
    imports: IPackageImports;
    importsReport: TImportsReports;
    versionReport: string;
    time: number;
    hasErrors?: true;
    hasWarnings?: true;
}

export interface IPackageImports {
    filesTotal: number;
    filesMatched: number;
    importsTotal: number;
    importsMatched: string[];
    importsUnique: string[];
}

export const packageImportsDefault: IPackageImports = {
    filesTotal: 0,
    filesMatched: 0,
    importsTotal: 0,
    importsMatched: [],
    importsUnique: [],
};

export interface IAnalyzeInput {
    packages: ReadonlyArray<IPackageInput>;
    matchExt?: string[];
    ignoreImports?: string[];
    packageJson?: string;
    countHits?: true;
    checkImports?: true;
    treatImports?: TTreatTypes | TTreatCallbackImport;
    checkDeps?: 'full' | 'local';
    treatDeps?: TTreatTypes | TTreatCallbackDep;
    checkPackageVersion?: true;
    treatPackageVersion?: TTreatTypes | TTreatCallbackVersion;
    logToConsole?: true;
    throwError?: true;
}

export interface IPackageJsonData {
    version?: string;
    dependencies?: {
        [name: string]: string;
    };
    devDependencies?: {
        [name: string]: string;
    };
    peerDependencies?: {
        [name: string]: string;
    };
}

export type IObjectTypes = number | string;

export interface IObject<T = IObjectTypes> {
    [key: string]: T;
}

export type TImportsReport = Map<string, IObjectTypes>;
export type TImportsReports = Map<string, IObject>;

export type TTreatTypes = 'err' | 'warn' | null;
export type TTreatCallbackImport = (
    pkgName: string,
    importType: 'absSame' | 'relExt',
    importPath: string
) => TTreatTypes;
export type TTreatCallbackDep = (pkgName: string, depType: 'local' | 'root', depName: string) => TTreatTypes;
export type TTreatCallbackVersion = (pkgName: string) => TTreatTypes;
