import { expect } from 'chai';
import { readFileSync } from 'fs';
import 'mocha';
import { resolve } from 'path';

import { analyze, IPackageInput } from '../src';

describe('passing', () => {
    const listPath: string = resolve(__dirname, './dummy-project/projects-list.json');
    const projectsList: string[] = JSON.parse(readFileSync(listPath, 'utf8'));

    const packages: IPackageInput[] = projectsList.map((project: string) => ({
        name: '@' + project,
        path: resolve(__dirname, './dummy-project/' + project),
    }));

    const analysis = analyze({
        packages,
        matchExt: ['.ts'],
        packageJson: resolve(__dirname, './dummy-project/package.json'),
        countHits: true,
        checkImports: true,
        checkDeps: 'local',
        checkPackageVersion: true,
        logToConsole: true,
        // throwError: true,
    });

    it('pass', () => expect(analysis).to.not.be.null);
});
