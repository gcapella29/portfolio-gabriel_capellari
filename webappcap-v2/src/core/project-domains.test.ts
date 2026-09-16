import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCustomDomain, normalizeNativeSubdomain } from './domain-normalization.ts';

test('normalizes native subdomains consistently', () => {
  assert.equal(normalizeNativeSubdomain(' Vet Sé '), 'vet-se');
  assert.equal(normalizeNativeSubdomain('Meu Projeto!!!'), 'meu-projeto');
  assert.equal(normalizeNativeSubdomain('---Loja---'), 'loja');
});

test('limits native subdomains to DNS label length', () => {
  assert.equal(normalizeNativeSubdomain('a'.repeat(80)).length, 63);
});

test('normalizes custom domains without protocol, path or trailing dot', () => {
  assert.equal(normalizeCustomDomain('HTTPS://Example.COM/catalogo'), 'example.com');
  assert.equal(normalizeCustomDomain(' loja.example.com. '), 'loja.example.com');
});

test('keeps empty domain values empty', () => {
  assert.equal(normalizeNativeSubdomain(''), '');
  assert.equal(normalizeCustomDomain(''), '');
});
