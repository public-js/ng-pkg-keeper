import { TIssueLevel } from './issue-level.types';

export type TImportIssues = 'absSame' | 'relExt' | 'banned';

export type TProcessImports = (pkgName: string, issueType: TImportIssues, importPath: string) => TIssueLevel;
