/* Cache public offline/reference assets only; never workshop records, API responses or authenticated pages. */
const MEDIA_CACHE='osp-part-media-v1';
const CACHE='osp-install-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('osp-install-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 const media=url.pathname==='/local-part-media.json'||/^\/part-media\/(alternator-[a-f0-9]{14}\.png|index\.html|CREDITS\.md|GNU-FDL-1\.[23]\.txt)$/.test(url.pathname);
 if(media){event.respondWith(caches.open(MEDIA_CACHE).then(async cache=>{const saved=await cache.match(request);if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}));return;}
 if(request.mode!=='navigate')return;
 event.respondWith(fetch(request).catch(async()=>await caches.match('/offline.html')||new Response('OSP AutoCare requires internet / Requiere internet',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
