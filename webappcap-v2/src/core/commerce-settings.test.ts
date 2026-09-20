import test from 'node:test';
import assert from 'node:assert/strict';
import {commerceSettings,replaceCommerceCatalogTerm} from './commerce-settings.ts';

test('commerce uses Catálogo as the generic default',()=>{
 const settings=commerceSettings({});
 assert.equal(settings.catalogLabel,'Catálogo');
 assert.equal(replaceCommerceCatalogTerm('Ver no cardápio →',settings),'Ver no catálogo →');
});

test('commerce does not turn an arbitrary section heading into navigation',()=>{
 const settings=commerceSettings({menu_title:'Peça do seu jeito'});
 assert.equal(settings.catalogLabel,'Catálogo');
});

test('legacy Cardápio and Opções normalize to Catálogo',()=>{
 assert.equal(commerceSettings({catalog_label:'Cardápio'}).catalogLabel,'Catálogo');
 assert.equal(commerceSettings({nav_menu:'Opções'}).catalogLabel,'Catálogo');
});

test('catalog terminology can still be explicitly configured',()=>{
 const settings=commerceSettings({catalog_label:'Produtos'});
 assert.equal(settings.catalogLabel,'Produtos');
 assert.equal(replaceCommerceCatalogTerm('CARDÁPIO',settings),'Produtos');
});
