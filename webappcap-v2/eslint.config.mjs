import {FlatCompat} from '@eslint/eslintrc';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const compat=new FlatCompat({baseDirectory:dirname(fileURLToPath(import.meta.url))});
const config = [
 {ignores:['.next/**','node_modules/**','public/**','next-env.d.ts']},
 ...compat.extends('next/core-web-vitals','next/typescript'),
 {
  files:['src/templates/commerce/commerce-modern.tsx','src/templates/commerce/bakery.tsx','src/app/home-site.tsx','src/templates/portfolio/native.tsx','src/app/dashboard/**/catalog/catalog-manager.tsx','src/app/dashboard/**/content/{direct-image-field,draggable-image-preview,page}.tsx','src/app/dashboard/**/media/media-gallery-editor.tsx','src/templates/trainer/**/*.tsx','src/templates/institutional/**/*.tsx'],
  // Native template images and editor blob/crop previews must retain their original geometry.
  rules:{'@next/next/no-img-element':'off'}
 }
];

export default config;
