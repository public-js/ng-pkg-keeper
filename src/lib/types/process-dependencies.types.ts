import { TIssueLevel } from './issue-level.types';

export type TDepsIssues =
    | 'eLocalNotListed'
    | 'eLocalUnused'
    | 'eLocalVerInvalid'
    | 'eRootVerInvalid'
    | 'eRootNotListedDep'
    | 'eRootMismatchDevDep'
    | 'eRootNotListedDevDep'
    | 'eRootNotListedPeerDep'
    | 'eLocalVMismatchRootV'
    | 'eLocalVMismatchRootR'
    | 'eLocalRMismatchRootV'
    | 'eLocalRMismatchRootR';

export type TProcessDeps = (pkgName: string, issueType: TDepsIssues, depName: string) => TIssueLevel;
