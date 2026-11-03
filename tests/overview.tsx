import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import WorkshopOverview from '../app/components/WorkshopOverview';
import {overviewData,recordDay} from '../lib/overview.ts';
const data={workorders:[
 {id:'a',title:'Brake service',status:'In progress',date:'2026-11-01',due:'2026-11-01',category:'Mechanical',labor:100,parts:20,lineItems:[{quantity:2,unitPrice:10}],tax:10},
 {id:'b',title:'Paint inspection',status:'Completed',date:'2026-10-01',due:'2026-10-01',category:'Body & paint',labor:50},
 {id:'c',status:'Delivered',date:'2025-12-01',labor:200},
 {id:'d',status:'Custom status',date:'2026-02-30',created:'2026-11-02T08:00:00Z',due:'invalid',labor:10},
 {id:'e',status:'Draft',date:'2026-11-15',labor:80}
],inventory:[{id:'i',quantity:0,reorder:0},{id:'j',quantity:2,reorder:5},{id:'k',quantity:6,reorder:5}],vehicles:[{id:'v'}],customers:[]};
const before=JSON.stringify(data),m=overviewData(data,new Date(2026,10,2),6);
assert.equal(m.active.length,3);assert.equal(m.closed.length,2);assert.equal(m.completion,40);assert.equal(m.openValue,244);assert.equal(m.late.length,1);assert.equal(m.late[0].id,'a');assert.equal(m.queue[0].id,'a');assert.equal(m.queue[1].id,'b');assert.equal(m.low.length,2);assert.equal(m.unknown,1);
assert.equal(m.buckets[0].key,'2026-06');assert.equal(m.buckets.at(-1)?.value,164);assert.equal(m.buckets.reduce((n,b)=>n+b.value,0),214);assert.equal(m.categories.reduce((n,c)=>n+c.count,0),5);assert.equal(JSON.stringify(data),before);
assert.equal(recordDay('2026-02-30'),'');assert.equal(recordDay('2024-02-29'),'2024-02-29');assert.equal(recordDay('2026-11-02T12:00:00Z'),'2026-11-02');assert.equal(overviewData({},new Date(2026,0,1),3).buckets[0].key,'2025-11');
for(const lang of [0,1])for(const records of [{},data]){
 const html=renderToStaticMarkup(<WorkshopOverview data={records} lang={lang} shopName="OSP Test" onNavigate={()=>{}} onOpen={()=>{}} label={()=>'Toyota Camry'}/>);
 assert(!/NaN|Infinity|undefined/.test(html));assert(html.includes('OSP Test'));assert(html.includes(lang?'Período del gráfico':'Chart period'));assert(html.includes(lang?'no representan cobros recibidos':'not collected payments'));assert(html.includes(lang?'Sin alertas de inventario bajo':'No low stock alerts')||records===data);
}
console.log('PASS: tenant-provided metrics, tax/parts totals, overdue priority, monthly boundaries, invalid/future dates, unknown statuses, no mutation and EN/ES empty/populated rendering.');
