import {database} from '../standalone/database.ts';
import {api} from '../lib/api.ts';
const output=process.argv[2];if(!output)throw Error('Usage: node --experimental-strip-types data/create-initial-db.ts /absolute/output.sqlite');
const DB=database(output);
const r=await api(new Request('http://localhost/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'osp',password:'101010'})}),{DB,BOOTSTRAP_ADMIN_PASSWORD:'101010'});
if(r.status!==200)throw Error('Initial admin creation failed');await DB.prepare('DELETE FROM sessions').run();await DB.prepare('DELETE FROM auth_attempts').run();DB.sqlite.close();console.log('Initial database created without sessions or payment credentials.');
