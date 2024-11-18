import wdioEslint from '@wdio/eslint'

export default wdioEslint.config([
    {
        ignores: ['dist', 'example']
    },
    /**
     * custom test configuration
     */
    {
        files: ['src/cjs/**/*'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
])
