import { expect } from 'chai';
import { readFileSync } from 'fs';
import 'mocha';
import { resolve } from 'path';

import { analyze } from '../src';

describe('passing', () => {
    const listPath: string = resolve(__dirname, './dummy-project/projects-list.json');
    const projectsList: string[] = JSON.parse(readFileSync(listPath, 'utf8'));

    const packagesPaths = projectsList.map((project: string) => resolve(__dirname, './dummy-project/' + project));

    const analysis = analyze({
        rootPath: resolve(__dirname, './dummy-project'),
        packagesPaths,
        matchExt: ['.ts'],
        checkImports: true,
        checkDeps: 'local',
        checkPackageVersion: true,
        logToConsole: true,
        logStats: true,
        countHits: true,
        // throwError: true,
    });

    it('pass', () => expect(analysis).to.not.be.null);
});
