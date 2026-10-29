/* OSP installation support: cache only the public offline document, never business data. */
const CACHE='osp-install-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('osp-install-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||request.mode!=='navigate')return;
 event.respondWith(fetch(request).catch(async()=>await caches.match('/offline.html')||new Response('OSP AutoCare requires internet / Requiere internet',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
