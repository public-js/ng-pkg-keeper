import { TObject } from '../types/object.types';
import { IReportItem } from '../types/report-item.interface';

export class ReportDepsLocal {
    eLocalNotListed: Map<string, IReportItem> = new Map<string, IReportItem>();
    eLocalUnused: Map<string, IReportItem> = new Map<string, IReportItem>();

    private reportTitles: TObject = {
        eLocalNotListed: 'Not listed as dependencies',
        eLocalUnused: 'Listed in json but unused',
    };

    get hasErrors(): boolean {
        return (
            Array.from(this.eLocalNotListed.values()).some((item) => item.level === 'err') ||
            Array.from(this.eLocalUnused.values()).some((item) => item.level === 'err')
        );
    }

    get hasWarnings(): boolean {
        return (
            Array.from(this.eLocalNotListed.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eLocalUnused.values()).some((item) => item.level === 'warn')
        );
    }

    get reportDetails(): TObject<string[]> {
        const details = {} as TObject<string[]>;
        if (this.eLocalNotListed.size > 0) {
            details[this.reportTitles.eLocalNotListed] = Array.from(this.eLocalNotListed.values()).map(
                (item) => item.details
            );
        }
        if (this.eLocalUnused.size > 0) {
            details[this.reportTitles.eLocalUnused] = Array.from(this.eLocalUnused.values()).map(
                (item) => item.details
            );
        }
        return details;
    }
}
