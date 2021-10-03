import { TObject } from '../types/object.types';
import { IReportItem } from '../types/report-item.interface';

export class ReportImports {
    absoluteSame: Map<string, IReportItem> = new Map<string, IReportItem>();
    relativeExt: Map<string, IReportItem> = new Map<string, IReportItem>();
    banned: Map<string, IReportItem> = new Map<string, IReportItem>();

    private reportTitles: TObject = {
        absoluteSame: 'Absolute imports from the same package',
        relativeExt: 'Relative external imports',
        banned: 'Banned imports',
    };

    get hasErrors(): boolean {
        return (
            Array.from(this.absoluteSame.values()).some((item) => item.level === 'err') ||
            Array.from(this.relativeExt.values()).some((item) => item.level === 'err') ||
            Array.from(this.banned.values()).some((item) => item.level === 'err')
        );
    }

    get hasWarnings(): boolean {
        return (
            Array.from(this.absoluteSame.values()).some((item) => item.level === 'warn') ||
            Array.from(this.relativeExt.values()).some((item) => item.level === 'warn') ||
            Array.from(this.banned.values()).some((item) => item.level === 'warn')
        );
    }

    get reportDetails(): TObject<string[]> {
        const details = {} as TObject<string[]>;
        if (this.absoluteSame.size > 0) {
            details[this.reportTitles.absoluteSame] = Array.from(this.absoluteSame.values()).map(
                (item) => item.details
            );
        }
        if (this.relativeExt.size > 0) {
            details[this.reportTitles.relativeExt] = Array.from(this.relativeExt.values()).map(
                (item) => item.details
            );
        }
        if (this.banned.size > 0) {
            details[this.reportTitles.banned] = Array.from(this.banned.values()).map((item) => item.details);
        }
        return details;
    }
}
