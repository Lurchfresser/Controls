/* eslint-env node */
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
    },
    root: true,
    overrides:[
        {
            files:["*.ts",".tsx"],
            plugins: ['@typescript-eslint'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
            rules: {
                "@typescript-eslint/typedef": [
                    "warn",
                    {
                        "variableDeclaration": true,
                        "arrowParameter":true,
                        "memberVariableDeclaration": true,
                        "objectDestructuring":true,
                        "parameter":true,
                        "propertyDeclaration":true
                    }
                ]
            },
        }
    ]
};