import { TIssueLevel } from './issue-level.types';
import { TProcessDeps } from './process-dependencies.types';
import { TProcessImports } from './process-imports.types';
import { TProcessPkgVersion } from './process-pkg-version.types';

type TCheckDeps = 'local' | 'full';

export interface IAnalyzeInput {
    rootPath: string;
    packagesPaths: string[];
    // If left unset, all the files containing '... from ...' will be analyzed
    matchExt?: string[];
    ignoreImports?: string[];
    bannedImports?: string[];
    checkImports?: true;
    // If falsy (or left unset), no imports will be reported
    treatImports?: TIssueLevel | TProcessImports;
    checkDeps?: TCheckDeps;
    // If falsy (or left unset), no dependencies will be reported
    treatDeps?: TIssueLevel | TProcessDeps;
    checkPackageVersion?: true;
    // If falsy (or left unset), no packages will be reported
    treatPackageVersion?: TIssueLevel | TProcessPkgVersion;
    // Useful to create pre-commit analysis report
    logToConsole?: true;
    logStats?: true;
    countHits?: true;
    // Useful for strict pre-commit rules
    throwError?: true;
}
