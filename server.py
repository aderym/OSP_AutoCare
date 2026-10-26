#!/usr/bin/env python3
"""OSP AutoCare - standard-library server, SQLite-backed."""
import os, json, sqlite3, secrets, hashlib, hmac, datetime, threading, urllib.request, urllib.parse, http.cookies, mimetypes, re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parent
DB=Path(os.environ.get('OSO_DB', str(ROOT/'oso.db')))
PORT=int(os.environ.get('PORT','8080'))
SESSIONS={}
LOCK=threading.Lock()
TABLES={
 'customers': {'name','phone','email','address','notes'},
 'vehicles': {'customer_id','year','make','model','trim','engine','vin','plate','mileage','notes'},
 'suppliers': {'name','phone','email','website','account','notes'},
 'inventory': {'sku','name','brand','qty','min_qty','cost','price','supplier_id','location','notes'},
 'workorders': {'customer_id','vehicle_id','assigned_to','title','complaint','diagnosis','work_done','status','labor','parts','tax','mileage','due_date','notes'},
 'services': {'vehicle_id','workorder_id','service_date','mileage','category','description','next_date','next_mileage','notes'},
 'purchases': {'supplier_id','order_number','status','date','total','items','notes'},
 'diagrams': {'year','make','model','system','part','title','url','notes'},
 'users': {'username','display_name','role','active'}
}
INTEGER={'customer_id','vehicle_id','assigned_to','supplier_id','workorder_id','year','mileage','qty','min_qty','next_mileage','active'}
FLOAT={'cost','price','labor','parts','tax','total'}
SCHEMA='''
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS vehicles (id INTEGER PRIMARY KEY, customer_id INTEGER, year INTEGER, make TEXT, model TEXT, trim TEXT, engine TEXT, vin TEXT, plate TEXT, mileage INTEGER DEFAULT 0, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT, website TEXT, account TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, sku TEXT, name TEXT NOT NULL, brand TEXT, qty INTEGER DEFAULT 0, min_qty INTEGER DEFAULT 0, cost REAL DEFAULT 0, price REAL DEFAULT 0, supplier_id INTEGER, location TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS workorders (id INTEGER PRIMARY KEY, customer_id INTEGER, vehicle_id INTEGER, assigned_to INTEGER, title TEXT, complaint TEXT, diagnosis TEXT, work_done TEXT, status TEXT DEFAULT 'Open', labor REAL DEFAULT 0, parts REAL DEFAULT 0, tax REAL DEFAULT 0, mileage INTEGER, due_date TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY, vehicle_id INTEGER, workorder_id INTEGER, service_date TEXT, mileage INTEGER, category TEXT, description TEXT, next_date TEXT, next_mileage INTEGER, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY, supplier_id INTEGER, order_number TEXT, status TEXT, date TEXT, total REAL DEFAULT 0, items TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS diagrams (id INTEGER PRIMARY KEY, year INTEGER, make TEXT, model TEXT, system TEXT, part TEXT, title TEXT NOT NULL, url TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
'''
def con():
 c=sqlite3.connect(DB, timeout=12)
 c.row_factory=sqlite3.Row
 c.execute('PRAGMA foreign_keys=ON')
 return c
def hashed(pw,salt):return hashlib.pbkdf2_hmac('sha256',pw.encode(),bytes.fromhex(salt),220000).hex()
def init():
 with con() as c:
  c.executescript(SCHEMA)
  if not c.execute('SELECT id FROM users LIMIT 1').fetchone():
   salt=secrets.token_hex(16)
   pw=os.environ.get('OSO_INITIAL_PASSWORD','8432137633')
   c.execute('INSERT INTO users(username,display_name,role,active,salt,password_hash) VALUES(?,?,?,?,?,?)',('osp','OSP Administrator','admin',1,salt,hashed(pw,salt)))
  if not c.execute('SELECT id FROM suppliers LIMIT 1').fetchone():
   c.executemany('INSERT INTO suppliers(name,website,notes) VALUES(?,?,?)',[
    ('AutoZone Pro','https://www.autozonepro.com/','Business account / ordering requires supplier credentials'),
    ('Advance Professional','https://www.advancepro.com/','Professional commercial account'),
    ('NAPA PROLink','https://www.napaprolink.com/','Wholesale account required'),
    ('O’Reilly First Call','https://www.firstcallonline.com/','Commercial access required'),
    ('RockAuto','https://www.rockauto.com/','Online parts catalog'),
    ('CarParts.com','https://www.carparts.com/','Online parts catalog')])
init()
class Handler(BaseHTTPRequestHandler):
 server_version='OSP-AutoCare/1.0'
 def log_message(self,fmt,*args):pass
 def sendjson(self,data,status=200,cookie=None):
  raw=json.dumps(data,ensure_ascii=False,default=str).encode()
  self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
 def body(self):
  try:
   n=int(self.headers.get('Content-Length','0'))
   if n>500000:return None
   return json.loads(self.rfile.read(n) or b'{}')
  except:return None
 def user(self):
  cookie=http.cookies.SimpleCookie()
  try:cookie.load(self.headers.get('Cookie',''))
  except:return None
  token=cookie.get('oso_session')
  if not token:return None
  entry=SESSIONS.get(token.value)
  if not entry:return None
  uid,expiry=entry
  if expiry<datetime.datetime.now().timestamp():SESSIONS.pop(token.value,None);return None
  with con() as c:r=c.execute('SELECT id,username,display_name,role,active FROM users WHERE id=?',(uid,)).fetchone()
  return dict(r) if r and r['active'] else None
 def auth(self):
  u=self.user()
  if not u:self.sendjson({'error':'Authentication required'},401)
  return u
 def allowed(self,u,table,method):
  if table=='users':return u['role']=='admin'
  if u['role']=='admin':return True
  if method=='GET':return True
  if table in ('workorders','services'):return True
  if table in ('customers','vehicles'):return method in ('POST','PUT')
  return False
 def do_GET(self):
  p=urllib.parse.urlparse(self.path);path=p.path
  if path=='/api/me':
   u=self.user();return self.sendjson({'user':u},200 if u else 401)
  if path.startswith('/api/'):
   u=self.auth()
   if not u:return
   if path=='/api/dashboard':
    with con() as c:
     counts={k:c.execute('SELECT COUNT(*) FROM '+k).fetchone()[0] for k in ('customers','vehicles','workorders','inventory','suppliers')}
     counts['open_orders']=c.execute("SELECT COUNT(*) FROM workorders WHERE status NOT IN ('Completed','Cancelled')").fetchone()[0]
     counts['low_stock']=c.execute('SELECT COUNT(*) FROM inventory WHERE qty<=min_qty').fetchone()[0]
     recent=[dict(x) for x in c.execute('SELECT w.id,w.title,w.status,w.created_at,v.year,v.make,v.model,c.name AS customer_name FROM workorders w LEFT JOIN vehicles v ON v.id=w.vehicle_id LEFT JOIN customers c ON c.id=w.customer_id ORDER BY w.id DESC LIMIT 8')]
    return self.sendjson({'counts':counts,'recent':recent})
   if path=='/api/vin':
    vin=urllib.parse.parse_qs(p.query).get('vin',[''])[0].strip().upper()
    if not re.fullmatch('[A-HJ-NPR-Z0-9]{17}',vin):return self.sendjson({'error':'VIN must be 17 valid characters'},400)
    try:
     url='https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/'+urllib.parse.quote(vin)+'?format=json'
     with urllib.request.urlopen(url,timeout=7) as res:data=json.load(res)
     d=data['Results'][0]
     return self.sendjson({'vin':vin,'year':d.get('ModelYear'),'make':d.get('Make'),'model':d.get('Model'),'trim':d.get('Trim'),'engine':d.get('EngineModel') or d.get('DisplacementL'),'warning':d.get('ErrorText')})
    except Exception:return self.sendjson({'error':'VIN service unavailable; enter vehicle manually'},502)
   if path=='/api/models':
    make=urllib.parse.parse_qs(p.query).get('make',[''])[0].strip()
    if not make or len(make)>80:return self.sendjson({'results':[]})
    try:
     url='https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/'+urllib.parse.quote(make)+'?format=json'
     with urllib.request.urlopen(url,timeout=7) as res:data=json.load(res)
     return self.sendjson({'results':sorted(set(x['Model_Name'] for x in data.get('Results',[])))})
    except:return self.sendjson({'results':[],'warning':'Live catalog unavailable'})
   table=path.split('/')[2] if len(path.split('/'))>2 else ''
   if table not in TABLES:return self.sendjson({'error':'Not found'},404)
   if not self.allowed(u,table,'GET'):return self.sendjson({'error':'Forbidden'},403)
   with con() as c:
    cols='id,'+','.join(sorted(TABLES[table]))+',created_at' if table!='users' else 'id,username,display_name,role,active,created_at'
    rows=[dict(r) for r in c.execute('SELECT '+cols+' FROM '+table+' ORDER BY id DESC LIMIT 3000')]
   return self.sendjson({'items':rows})
  if path=='/':path='/index.html'
  if '..' in Path(path).parts or path not in ('/index.html','/styles.css','/app.js','/assets/logo.svg'):
   self.send_error(404);return
  file=ROOT/path.lstrip('/')
  try:raw=file.read_bytes()
  except:return self.send_error(404)
  self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(file.name)[0] or 'text/plain');self.send_header('Cache-Control','no-cache');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
 def do_POST(self):self.write('POST')
 def do_PUT(self):self.write('PUT')
 def do_DELETE(self):self.write('DELETE')
 def write(self,method):
  p=urllib.parse.urlparse(self.path).path;data=self.body() if method!='DELETE' else {}
  if data is None:return self.sendjson({'error':'Invalid JSON'},400)
  if p=='/api/login' and method=='POST':
   name=str(data.get('username','')).strip().lower();password=str(data.get('password',''))
   with con() as c:r=c.execute('SELECT * FROM users WHERE username=?',(name,)).fetchone()
   if not r or not r['active'] or not hmac.compare_digest(hashed(password,r['salt']),r['password_hash']):return self.sendjson({'error':'Invalid credentials'},401)
   t=secrets.token_urlsafe(32);SESSIONS[t]=(r['id'],datetime.datetime.now().timestamp()+3600*12)
   return self.sendjson({'ok':True},cookie='oso_session='+t+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200')
  if p=='/api/logout' and method=='POST':
   cookie=http.cookies.SimpleCookie();cookie.load(self.headers.get('Cookie',''))
   if cookie.get('oso_session'):SESSIONS.pop(cookie['oso_session'].value,None)
   return self.sendjson({'ok':True},cookie='oso_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
  u=self.auth()
  if not u:return
  parts=p.strip('/').split('/')
  if len(parts)<2 or parts[0]!='api' or parts[1] not in TABLES:return self.sendjson({'error':'Not found'},404)
  table=parts[1]
  if not self.allowed(u,table,method):return self.sendjson({'error':'Admin permission required'},403)
  id_=None
  if len(parts)>2:
   try:id_=int(parts[2])
   except:return self.sendjson({'error':'Invalid ID'},400)
  if method in ('PUT','DELETE') and not id_:return self.sendjson({'error':'ID required'},400)
  if table=='users':
   if method=='DELETE' and id_==u['id']:return self.sendjson({'error':'Cannot delete yourself'},400)
   if method=='POST':
    username=str(data.get('username','')).strip().lower()
    pw=str(data.get('password',''))
    if not re.fullmatch('[a-z0-9_.-]{3,40}',username) or len(pw)<8:return self.sendjson({'error':'Username 3+ characters, password 8+ characters required'},400)
    salt=secrets.token_hex(16)
    try:
     with con() as c:c.execute('INSERT INTO users(username,display_name,role,active,salt,password_hash) VALUES(?,?,?,?,?,?)',(username,str(data.get('display_name','')),data.get('role') if data.get('role') in ('admin','employee') else 'employee',1,salt,hashed(pw,salt)))
     return self.sendjson({'ok':True})
    except sqlite3.IntegrityError:return self.sendjson({'error':'Username already exists'},409)
   if method=='PUT':
    vals={k:data[k] for k in ('display_name','active','role') if k in data}
    if vals.get('role') not in (None,'admin','employee'):return self.sendjson({'error':'Invalid role'},400)
    if 'password' in data and data['password']:
     if len(str(data['password']))<8:return self.sendjson({'error':'Password minimum 8 characters'},400)
     salt=secrets.token_hex(16);vals.update({'salt':salt,'password_hash':hashed(str(data['password']),salt)})
    if id_==u['id'] and (vals.get('active')==0 or vals.get('role')=='employee'):return self.sendjson({'error':'Cannot demote or disable yourself'},400)
    if vals:
     with con() as c:c.execute('UPDATE users SET '+','.join(k+'=?' for k in vals)+' WHERE id=?',(*vals.values(),id_))
    return self.sendjson({'ok':True})
  if method!='DELETE':
   if not isinstance(data,dict):return self.sendjson({'error':'Object required'},400)
   vals={k:data[k] for k in TABLES[table] if k in data}
   for k,v in vals.items():
    if k in INTEGER:
     try:vals[k]=int(v) if v not in ('',None) else None
     except:return self.sendjson({'error':'Invalid number: '+k},400)
    if k in FLOAT:
     try:vals[k]=float(v) if v not in ('',None) else 0
     except:return self.sendjson({'error':'Invalid price: '+k},400)
   if table=='workorders' and vals.get('status') not in (None,'Open','In Progress','Waiting Parts','Completed','Cancelled'):
    return self.sendjson({'error':'Invalid status'},400)
   if table=='diagrams' and vals.get('url') and not str(vals['url']).startswith(('https://','http://')):return self.sendjson({'error':'Diagram URL must be HTTP(S)'},400)
   if method=='POST' and table in ('customers','suppliers','inventory','diagrams') and not vals.get('name',vals.get('title')):
    return self.sendjson({'error':'Name or title required'},400)
  try:
   with con() as c:
    if method=='DELETE':
     c.execute('DELETE FROM '+table+' WHERE id=?',(id_,));return self.sendjson({'ok':True})
    if not vals:return self.sendjson({'error':'No fields supplied'},400)
    if method=='POST':
     cur=c.execute('INSERT INTO '+table+' ('+','.join(vals)+') VALUES ('+','.join('?' for _ in vals)+')',tuple(vals.values()))
     return self.sendjson({'ok':True,'id':cur.lastrowid},201)
    c.execute('UPDATE '+table+' SET '+','.join(k+'=?' for k in vals)+' WHERE id=?',(*vals.values(),id_))
    return self.sendjson({'ok':True})
  except sqlite3.IntegrityError as exc:return self.sendjson({'error':'Database constraint: '+str(exc)},400)
  except sqlite3.Error:return self.sendjson({'error':'Database error'},500)
if __name__=='__main__':
 print('OSP AutoCare: http://localhost:'+str(PORT),flush=True)
 ThreadingHTTPServer(('0.0.0.0',PORT),Handler).serve_forever()
