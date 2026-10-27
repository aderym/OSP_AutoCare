import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {pbkdf2Sync,randomBytes} from 'node:crypto';
export function initializeSnapshotOwner(db:any,password:string){
const owner=db.sqlite.prepare("SELECT id FROM users WHERE username='osp' AND role='owner' AND password=''").get();
if(!owner)return;
if(!password)throw Error('Set BOOTSTRAP_ADMIN_PASSWORD before restoring a snapshot with an uninitialized owner.');
const salt=randomBytes(16).toString('hex');
const encoded=salt+':'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
db.sqlite.prepare("UPDATE users SET password=? WHERE id=? AND password=''").run(encoded,owner.id);
}
export function database(filename:string){
fs.mkdirSync(path.dirname(filename),{recursive:true});const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
const db:any={prepare(sql:string){return {args:[] as any[],bind(...args:any[]){this.args=args;return this;},async first(){return sqlite.prepare(sql).get(...this.args)||null;},async all(){return {results:sqlite.prepare(sql).all(...this.args)};},async run(){return sqlite.prepare(sql).run(...this.args);}};},async batch(statements:any[]){sqlite.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}},sqlite};
sqlite.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)');for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){if(!sqlite.prepare('SELECT name FROM _migrations WHERE name=?').get(file)){sqlite.exec('BEGIN');try{sqlite.exec(fs.readFileSync('drizzle/'+file,'utf8'));sqlite.prepare('INSERT INTO _migrations VALUES (?)').run(file);sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}}}return db;
}
