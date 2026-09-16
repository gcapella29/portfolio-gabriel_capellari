import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyHost, isPublicAssetPath } from './host-routing';

test('classifies platform hosts', () => {
  assert.deepEqual(classifyHost('webappcap.com.br'), { kind: 'platform', host: 'webappcap.com.br' });
  assert.deepEqual(classifyHost('www.webappcap.com.br'), { kind: 'platform', host: 'www.webappcap.com.br' });
  assert.equal(classifyHost('preview-123.vercel.app').kind, 'platform');
});

test('normalizes protocol, port, path and case before routing', () => {
  assert.deepEqual(classifyHost('HTTPS://VET-SE.WEBAPPCAP.COM.BR:443/catalogo'), {
    kind: 'native',
    host: 'vet-se.webappcap.com.br',
    subdomain: 'vet-se',
  });
});

test('classifies native WebAppCap subdomains generically', () => {
  assert.deepEqual(classifyHost('capellari.webappcap.com.br'), {
    kind: 'native',
    host: 'capellari.webappcap.com.br',
    subdomain: 'capellari',
  });
});

test('classifies external domains as custom', () => {
  assert.deepEqual(classifyHost('example.com'), { kind: 'custom', host: 'example.com' });
});

test('recognizes public assets without swallowing application routes', () => {
  assert.equal(isPublicAssetPath('/_next/static/chunk.js'), true);
  assert.equal(isPublicAssetPath('/favicon.ico'), true);
  assert.equal(isPublicAssetPath('/images/logo.webp'), true);
  assert.equal(isPublicAssetPath('/owner/projects'), false);
  assert.equal(isPublicAssetPath('/catalogo'), false);
});
