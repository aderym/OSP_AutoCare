import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {localPartMedia,mergePartMedia} from '../lib/parts-finder.ts';
const bank=JSON.parse(fs.readFileSync('public/local-part-media.json','utf8'));
assert.equal(bank.items.length,48);assert.equal(bank.errors.length,0);assert.equal(new Set(bank.items.map((i:any)=>i.url)).size,48);
for(const i of bank.items){assert(/^\/part-media\/alternator-[a-f0-9]{14}\.png$/.test(i.image));const bytes=fs.readFileSync('public'+i.image);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),i.sha256);assert.equal(bytes.length,i.bytes);assert(i.license&&i.url.startsWith('https://commons.wikimedia.org/'));assert(i.width>0&&i.height>0&&i.width<=600&&i.height<=600);}
assert.equal(localPartMedia(bank.items,'Alternador').length,48);assert.equal(localPartMedia(bank.items,'alternator').length,48);assert.equal(localPartMedia(bank.items,'oil pan').length,0,'do not show alternator media as an unrelated part');
assert(localPartMedia(bank.items,'alternator').some((i:any)=>i.kind==='diagram'));
const local=bank.items[0],remote={...local,image:'https://upload.wikimedia.org/temporary.jpg',local:false};assert.equal(mergePartMedia([local],[remote])[0].image,local.image,'prefer bundled PNG for the same source');
assert(fs.existsSync('public/part-media/CREDITS.md'));for(const version of ['1.2','1.3'])assert(fs.readFileSync('public/part-media/GNU-FDL-'+version+'.txt','utf8').includes('GNU Free Documentation License'));
assert(fs.readFileSync('public/part-media/index.html','utf8').includes(local.id+'.png'));
console.log('PASS: 48 attributed PNG assets, checksums/dimensions, bilingual local lookup, diagram reference and local-over-remote preference.');
