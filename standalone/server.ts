import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {api} from '../lib/api.ts';
import {database,initializeSnapshotOwner} from './database.ts';
const DB=database(process.env.DATABASE_PATH||'runtime/osp-autocare.sqlite');
if(!process.env.PAYMENT_ENCRYPTION_KEY)throw Error('Set PAYMENT_ENCRYPTION_KEY to a random secret. Keep it for future restarts.');
const env={DB,OPENAI_API_KEY:process.env.OPENAI_API_KEY,PAYMENT_ENCRYPTION_KEY:process.env.PAYMENT_ENCRYPTION_KEY,BOOTSTRAP_ADMIN_PASSWORD:process.env.BOOTSTRAP_ADMIN_PASSWORD||''};
initializeSnapshotOwner(DB,env.BOOTSTRAP_ADMIN_PASSWORD);
const mime:any={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{try{const proto=process.env.APP_ORIGIN?.startsWith('https:')?'https':'http';const base=process.env.APP_ORIGIN||`${proto}://${req.headers.host}`;const url=new URL(req.url||'/',base);
if(url.pathname.startsWith('/api/')){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1500000){res.writeHead(413);res.end('Too large');return;}chunks.push(chunk);}const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);const body=Buffer.concat(chunks);const r=await api(new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method||'GET')?undefined:body}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;}
const root=path.resolve('standalone-dist');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=3600'});fs.createReadStream(file).pipe(res);
}catch(e){console.error(e);res.writeHead(500);res.end('Server error');}}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('OSP AutoCare listening on port '+(process.env.PORT||3000)));
