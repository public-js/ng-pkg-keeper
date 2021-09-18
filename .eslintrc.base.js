module.exports = {
    env: {
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            'typescript': {},
            'node': {
                'extensions': ['.js', '.ts'],
                'paths': ['node_modules/', 'node_modules/@types']
            },
        },
    },
    rules: {
        // 'import/no-extraneous-dependencies': [2, { 'devDependencies': ['**/test.ts'] }],
        '@typescript-eslint/indent': ['warn', 4,
            {
                'VariableDeclarator': 'first',
                'SwitchCase': 1,
            }],
        'array-bracket-spacing': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        'quotes': ['error', 'single']
    },
};
