import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import dastyle from 'eslint-config-dicodingacademy';

export default defineConfig([
  dastyle,
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.node } },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: {
      indent: ['error', 4],
      'linebreak-style': ['error', 'windows'],
    },
  },
  {
    files: ['migrations/**/*.js'],
    rules: {
      camelcase: 'off',
    },
  },
]);
