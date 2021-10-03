export function countImportsHits(importsUnique: string[], importsMatched: string[]): [string, number][] {
    return importsUnique.map((imp: string) => [
        imp,
        importsMatched.filter((im: string) => im === imp).length,
    ]);
}
