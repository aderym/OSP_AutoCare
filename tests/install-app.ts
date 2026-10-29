import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {installPlatform,canSuggestInstall} from '../lib/install.ts';
assert.equal(installPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), 'ios');
assert.equal(installPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',5),'ios','iPad desktop-style user agent');
assert.equal(installPlatform('Mozilla/5.0 (Linux; Android 15; Tablet)'), 'android');
assert.equal(installPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), 'desktop');
assert.equal(installPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',0),'mac');
assert.equal(canSuggestInstall(true,0,1000),false);assert.equal(canSuggestInstall(false,2000,1000),false);assert.equal(canSuggestInstall(false,999,1000),true);
const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert.equal(manifest.id,'/');assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.prefer_related_applications,false);
for(const size of [192,512]){const icon=manifest.icons.find((x:any)=>x.sizes===`${size}x${size}`&&x.purpose==='any');assert(icon);const data=fs.readFileSync('public'+icon.src);assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);}
assert(manifest.icons.some((x:any)=>x.purpose==='maskable'));assert(fs.existsSync('public/app-icon-180.png'));
// Exercise service worker events: only a public offline fallback may enter its cache.
const events:any={},added:string[]=[],removed:string[]=[],network:any[]=[];
let failed=false;const self={location:{origin:'https://app.example'},skipWaiting(){},clients:{claim:async()=>{}},addEventListener:(name:string,fn:any)=>events[name]=fn};
const caches={open:async()=>({add:async(p:string)=>{added.push(p);}}),keys:async()=>['osp-install-offline-v0','osp-install-offline-v1','unrelated-cache'],delete:async(k:string)=>{removed.push(k);},match:async(p:string)=>new Response('Public offline '+p)};
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),{self,caches,URL,Response,fetch:async(r:any)=>{network.push(r);if(failed)throw Error('Offline');return new Response('Fresh network');}});
let pending:any;events.install({waitUntil:(p:any)=>pending=p});await pending;assert.deepEqual(added,['/offline.html']);events.activate({waitUntil:(p:any)=>pending=p});await pending;assert.deepEqual(removed,['osp-install-offline-v0']);
function request(url:string,method='GET',mode='navigate'){let result:any;events.fetch({request:{url,method,mode},respondWith:(p:any)=>result=p});return result;}
assert.equal(request('https://app.example/api/records'),undefined,'private APIs are never intercepted');assert.equal(request('https://app.example/api/login','POST'),undefined);assert.equal(request('https://payments.example/','GET'),undefined);assert.equal(request('https://app.example/','GET','cors'),undefined,'RSC and XHR pass through');
assert.equal(await (await request('https://app.example/')).text(),'Fresh network');assert.deepEqual(added,['/offline.html'],'authenticated navigation is not cached');failed=true;assert.equal(await (await request('https://app.example/')).text(),'Public offline /offline.html');assert.equal(network.length,2);
console.log('PASS: device detection, install cooldown, manifest/icon dimensions and service-worker private-data exclusions.');
