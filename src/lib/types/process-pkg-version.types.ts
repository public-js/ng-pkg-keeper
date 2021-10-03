import { TIssueLevel } from './issue-level.types';

export type TProcessPkgVersion = (pkgName: string) => TIssueLevel;
