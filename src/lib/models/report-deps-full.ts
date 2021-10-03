import { TObject } from '../types/object.types';
import { IReportItem } from '../types/report-item.interface';

export class ReportDepsFull {
    eLocalRMismatchRootR: Map<string, IReportItem> = new Map<string, IReportItem>();
    eLocalRMismatchRootV: Map<string, IReportItem> = new Map<string, IReportItem>();
    eLocalVMismatchRootR: Map<string, IReportItem> = new Map<string, IReportItem>();
    eLocalVMismatchRootV: Map<string, IReportItem> = new Map<string, IReportItem>();
    eLocalVerInvalid: Map<string, IReportItem> = new Map<string, IReportItem>();
    eRootMismatchDevDep: Map<string, IReportItem> = new Map<string, IReportItem>();
    eRootNotListedDep: Map<string, IReportItem> = new Map<string, IReportItem>();
    eRootNotListedDevDep: Map<string, IReportItem> = new Map<string, IReportItem>();
    eRootNotListedPeerDep: Map<string, IReportItem> = new Map<string, IReportItem>();
    eRootVerInvalid: Map<string, IReportItem> = new Map<string, IReportItem>();

    private reportTitles: TObject = {
        eLocalRMismatchRootR: 'Ranges that don\'t intersect',
        eLocalRMismatchRootV: 'Ranges that don\'t include versions',
        eLocalVMismatchRootR: 'Ranges that don\'t include versions',
        eLocalVMismatchRootV: 'Mismatching versions',
        eLocalVerInvalid: 'Invalid versions in local json',
        eRootMismatchDevDep: 'Dev dependencies listed as dependencies',
        eRootNotListedDep: 'Dependencies not listed in root json',
        eRootNotListedDevDep: 'Dev dependencies not listed in root json',
        eRootNotListedPeerDep: 'Peer dependencies not listed in root json',
        eRootVerInvalid: 'Invalid versions in root json',
    };

    get hasErrors(): boolean {
        return (
            Array.from(this.eLocalRMismatchRootR.values()).some((item) => item.level === 'err') ||
            Array.from(this.eLocalRMismatchRootV.values()).some((item) => item.level === 'err') ||
            Array.from(this.eLocalVMismatchRootR.values()).some((item) => item.level === 'err') ||
            Array.from(this.eLocalVMismatchRootV.values()).some((item) => item.level === 'err') ||
            Array.from(this.eLocalVerInvalid.values()).some((item) => item.level === 'err') ||
            Array.from(this.eRootMismatchDevDep.values()).some((item) => item.level === 'err') ||
            Array.from(this.eRootNotListedDep.values()).some((item) => item.level === 'err') ||
            Array.from(this.eRootNotListedDevDep.values()).some((item) => item.level === 'err') ||
            Array.from(this.eRootNotListedPeerDep.values()).some((item) => item.level === 'err') ||
            Array.from(this.eRootVerInvalid.values()).some((item) => item.level === 'err')
        );
    }

    get hasWarnings(): boolean {
        return (
            Array.from(this.eLocalRMismatchRootR.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eLocalRMismatchRootV.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eLocalVMismatchRootR.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eLocalVMismatchRootV.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eLocalVerInvalid.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eRootMismatchDevDep.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eRootNotListedDep.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eRootNotListedDevDep.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eRootNotListedPeerDep.values()).some((item) => item.level === 'warn') ||
            Array.from(this.eRootVerInvalid.values()).some((item) => item.level === 'warn')
        );
    }

    get reportDetails(): TObject<string[]> {
        const details = {} as TObject<string[]>;
        if (this.eLocalRMismatchRootR.size > 0) {
            details[this.reportTitles.eLocalRMismatchRootR] = Array.from(this.eLocalRMismatchRootR.values()).map(
                (item) => item.details
            );
        }
        if (this.eLocalRMismatchRootV.size > 0) {
            details[this.reportTitles.eLocalRMismatchRootV] = Array.from(this.eLocalRMismatchRootV.values()).map(
                (item) => item.details
            );
        }
        if (this.eLocalVMismatchRootR.size > 0) {
            details[this.reportTitles.eLocalVMismatchRootR] = Array.from(this.eLocalVMismatchRootR.values()).map(
                (item) => item.details
            );
        }
        if (this.eLocalVMismatchRootV.size > 0) {
            details[this.reportTitles.eLocalVMismatchRootV] = Array.from(this.eLocalVMismatchRootV.values()).map(
                (item) => item.details
            );
        }
        if (this.eLocalVerInvalid.size > 0) {
            details[this.reportTitles.eLocalVerInvalid] = Array.from(this.eLocalVerInvalid.values()).map((item) => item.details);
        }
        if (this.eRootMismatchDevDep.size > 0) {
            details[this.reportTitles.eRootMismatchDevDep] = Array.from(this.eRootMismatchDevDep.values()).map(
                (item) => item.details
            );
        }
        if (this.eRootNotListedDep.size > 0) {
            details[this.reportTitles.eRootNotListedDep] = Array.from(this.eRootNotListedDep.values()).map(
                (item) => item.details
            );
        }
        if (this.eRootNotListedDevDep.size > 0) {
            details[this.reportTitles.eRootNotListedDevDep] = Array.from(this.eRootNotListedDevDep.values()).map(
                (item) => item.details
            );
        }
        if (this.eRootNotListedPeerDep.size > 0) {
            details[this.reportTitles.eRootNotListedPeerDep] = Array.from(this.eRootNotListedPeerDep.values()).map(
                (item) => item.details
            );
        }
        if (this.eRootVerInvalid.size > 0) {
            details[this.reportTitles.eRootVerInvalid] = Array.from(this.eRootVerInvalid.values()).map((item) => item.details);
        }
        return details;
    }
}
