import { IReportItem } from '../types/report-item.interface';
import { ReportDepsFull } from './report-deps-full';
import { ReportDepsLocal } from './report-deps-local';
import { ReportImports } from './report-imports';

export class PackageReports {
    importsHits: Map<string, number> = new Map<string, number>();
    versionCheck: IReportItem | undefined;
    importsCheck: ReportImports | undefined;
    depsLocalCheck: ReportDepsLocal | undefined;
    depsFullCheck: ReportDepsFull | undefined;

    get hasErrors(): boolean {
        return (
            this.versionCheck?.level === 'err' ||
            this.importsCheck?.hasErrors ||
            this.depsLocalCheck?.hasErrors ||
            this.depsFullCheck?.hasErrors
        ) || false;
    }

    get hasWarnings(): boolean {
        return (
            this.versionCheck?.level === 'warn' ||
            this.importsCheck?.hasWarnings ||
            this.depsLocalCheck?.hasWarnings ||
            this.depsFullCheck?.hasWarnings
        ) || false;
    }
}
