import { TIssueLevel } from './issue-level.types';

export interface IReportItem {
    level: TIssueLevel;
    details: string;
}
