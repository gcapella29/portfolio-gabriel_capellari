import test from 'node:test';
import assert from 'node:assert/strict';
import {commerceSettings,replaceCommerceCatalogTerm} from './commerce-settings.ts';

test('commerce keeps cardápio as the generic default',()=>{
 const settings=commerceSettings({});
 assert.equal(settings.catalogLabel,'Cardápio');
 assert.equal(replaceCommerceCatalogTerm('Ver no cardápio →',settings),'Ver no cardápio →');
});

test('commerce reuses terminology already stored by a project',()=>{
 const settings=commerceSettings({menu_title:'Catálogo'});
 assert.equal(settings.catalogLabel,'Catálogo');
 assert.equal(replaceCommerceCatalogTerm('Ver no cardápio →',settings),'Ver no catálogo →');
 assert.equal(replaceCommerceCatalogTerm('CARDÁPIO',settings),'Catálogo');
});

test('catalog terminology can be configured without project slug rules',()=>{
 const settings=commerceSettings({catalog_label:'Produtos'});
 assert.equal(settings.catalogLabel,'Produtos');
 assert.equal(replaceCommerceCatalogTerm('CARDÁPIO',settings),'Produtos');
});
