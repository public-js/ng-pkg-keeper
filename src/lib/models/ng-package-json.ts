export interface INgPackageJson {
    allowedNonPeerDependencies: string[];
    lib: {
        entryFile?: string;
    };
}

export class NgPackageJson implements INgPackageJson {
    allowedNonPeerDependencies: string[] = [];
    lib: { entryFile?: string } = {};

    constructor(params: Partial<INgPackageJson>) {
        Object.assign(this, params);
    }
}
