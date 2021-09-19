/**
 * @typedef IPackageInput
 * @type {object}
 */
export interface IPackageInput {
    /**
     * @type {string} - Package name
     */
    name: string;
    /**
     * @type {string} - Absolute package path
     */
    path: string;
    /**
     * @type {string} - Absolute path to package.json file
     * If left unset, it must be available at 'path/package.json'
     */
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
    matchedMap: Map<string, string[]>;
    packageJsonFiles: string[];
    subpackages: {
        names: string[];
        paths: string[];
        nameToPath: Map<string, string>;
        pathToName: Map<string, string>;
    };
}

export const packageImportsDefault: IPackageImports = {
    filesTotal: 0,
    filesMatched: 0,
    importsTotal: 0,
    importsMatched: [],
    importsUnique: [],
    matchedMap: new Map<string, string[]>(),
    packageJsonFiles: [],
    subpackages: {
        names: [],
        paths: [],
        nameToPath: new Map<string, string>(),
        pathToName: new Map<string, string>(),
    },
};

/**
 * @typedef IAnalyzeInput
 * @type {object}
 */
export interface IAnalyzeInput {
    /**
     * @type {IPackageInput[]} - List of packages to analyze
     */
    packages: ReadonlyArray<IPackageInput>;
    /**
     * @type {string[]} - File extensions to analyze
     * If left unset, all the files containing 'import {...} from' will be analyzed
     */
    matchExt?: string[];
    /**
     * @type {string[]} - Imports to exclude from the analysis
     */
    ignoreImports?: string[];
    /**
     * @type {string[]} - Imports to be reported as banned
     */
    bannedImports?: string[];
    /**
     * @type {string} - An absolute path to the root project package.json file
     * Required if checkDeps of checkPackageVersion is passed
     */
    packageJson?: string;
    /**
     * @type {boolean} - Count import hits; useful for statistic
     */
    countHits?: true;
    /**
     * @type {boolean} - Check and report imports
     */
    checkImports?: true;
    /**
     * @type {(TTreatTypes|TTreatCallbackImport)} - Report level for failed import checks
     * If left unset or null, no imports will be reported
     */
    treatImports?: TTreatTypes | TTreatCallbackImport;
    /**
     * @type {TCheckDepsTypes} - Check and report dependencies
     * Requires packageJson to be provided
     */
    checkDeps?: TCheckDepsTypes;
    /**
     * @type {(TTreatTypes|TTreatCallbackDep)} - Report level for failed dependency checks
     * If left unset or null, no dependencies will be reported
     */
    treatDeps?: TTreatTypes | TTreatCallbackDep;
    /**
     * @type {boolean} - Check and report package versions
     * Requires packageJson to be provided
     */
    checkPackageVersion?: true;
    /**
     * @type {(TTreatTypes|TTreatCallbackVersion)} - Report level for failed version checks
     * If left unset or null, no packages will be reported
     */
    treatPackageVersion?: TTreatTypes | TTreatCallbackVersion;
    /**
     * @type {boolean} - Log report to console
     * Useful to create pre-commit analysis report
     */
    logToConsole?: true;
    /**
     * @type {boolean} - Throw an error after the analysis if any errors occurred
     * Useful for strict pre-commit rules
     */
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
    ngPackage?: unknown;
}

export type IObjectTypes = number | string;

export interface IObject<T = IObjectTypes> {
    [key: string]: T;
}

export type TImportsReport = Map<string, IObjectTypes>;
export type TImportsReports = Map<string, IObject>;

/**
 * @callback TTreatCallbackImport
 * @param {string} pkgName - The package name in which an issue occurred
 * @param {TImportTypes} importType - Issue type
 * @param {string} importPath - Import that triggered an issue
 * @returns {TTreatTypes}
 */
export type TTreatCallbackImport = (
    pkgName: string,
    importType: TImportTypes,
    importPath: string
) => TTreatTypes;

/**
 * @callback TTreatCallbackDep
 * @param {string} pkgName - The package name in which an issue occurred
 * @param {TDepsTypes} depType - Issue type
 * @param {string} depName - Dependency name that triggered an issue
 * @returns {TTreatTypes}
 */
export type TTreatCallbackDep = (pkgName: string, depType: TDepsTypes, depName: string) => TTreatTypes;

/**
 * @callback TTreatCallbackVersion
 * @param {string} pkgName - The package name in which an issue occurred
 * @returns {TTreatTypes}
 */
export type TTreatCallbackVersion = (pkgName: string) => TTreatTypes;

/**
 * @typedef TTreatTypes
 * @type {(string|null)}
 * Report levels:
 * err - error,
 * warn - warning,
 * null - none
 */
export type TTreatTypes = 'err' | 'warn' | null;

/**
 * @typedef TImportTypes
 * @type {string}
 * Import issue types:
 * absSame - absolute import from the same package,
 * relExt - relative import from an external package,
 * banned - banned import
 */
type TImportTypes = 'absSame' | 'relExt' | 'banned';

/**
 * @typedef TCheckDepsTypes
 * Dependency check types:
 * local - check only local (per-package) package.json files,
 * full - check local & root package.json files for issues
 */
export type TCheckDepsTypes = 'local' | 'full';

/**
 * @typedef TDepsTypes
 * @type {string}
 * Dependency issue types:
 * local - local package issue,
 * root - root package.json issue
 */
type TDepsTypes = 'local' | 'root';
