import { IPackageImports, TImportsReport } from '../types';

export function countImportHits(imports: IPackageImports): TImportsReport {
    const report: TImportsReport = new Map<string, string>([]);

    imports.importsUnique.forEach((item: string) => {
        const hits = imports.importsMatched.filter((imp: string) => imp === item);
        report.set(item, hits.length);
    });

    return report;
}
