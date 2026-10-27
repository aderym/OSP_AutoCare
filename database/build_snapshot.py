"""Build a portable SQLite/SQL copy; never reads or changes the live database."""
import json,sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
FOLDER=ROOT/'database'
source=json.loads((FOLDER/'snapshot.json').read_text())
output=FOLDER/'osp-autocare.sqlite'
if output.exists():
    raise SystemExit('Output already exists. Choose a fresh snapshot folder; existing data is never overwritten.')
db=sqlite3.connect(output)
db.execute('CREATE TABLE _migrations (name TEXT PRIMARY KEY)')
for migration in sorted((ROOT/'drizzle').glob('*.sql')):
    db.executescript(migration.read_text())
    db.execute('INSERT INTO _migrations VALUES (?)',(migration.name,))

for table,rows in source['tables'].items():
    if table not in {'shops','users','customers','vehicles','suppliers','inventory','workorders','services','purchases','diagrams'}:
        raise ValueError('Unexpected snapshot table')
    columns={r[1] for r in db.execute('PRAGMA table_info("'+table+'")')}
    for item in rows:
        row=dict(item)
        if table=='users':
            row['password']=''
            row['active']=0
        if set(row)-columns:
            raise ValueError('Snapshot column not present in schema')
        names=list(row)
        db.execute('INSERT INTO "'+table+'" ('+','.join('"'+n+'"' for n in names)+') VALUES ('+','.join('?' for _ in names)+')',[row[n] for n in names])
db.commit()
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
for table in ('sessions','auth_attempts','payment_settings'):
    assert db.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0
lines=list(db.iterdump())
(FOLDER/'schema_and_data.sql').write_text('\n'.join(lines)+'\n')
(FOLDER/'schema.sql').write_text('\n'.join(x for x in lines if x.startswith('CREATE '))+'\n')
(FOLDER/'data.sql').write_text('BEGIN TRANSACTION;\n'+'\n'.join(x for x in lines if x.startswith('INSERT '))+'\nCOMMIT;\n')
counts={t:db.execute('SELECT COUNT(*) FROM '+t).fetchone()[0] for t in source['tables']}
manifest={k:v for k,v in source.items() if k!='tables'}
manifest['counts']=counts
manifest['localCredentials']='All snapshot accounts are disabled and all password fields are empty. After copying SQLite to a fresh runtime path, run initialize_owner.py for that copy to choose the local OSP password. No live or generated password hash is committed.'
manifest['catalog']='The 50,407 vehicle configurations and 284 part names remain in public/vehicle-catalog and public/parts-catalog.json, separate from workshop customer records.'
(FOLDER/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
db.close()
print(json.dumps({'integrity':'ok','counts':counts,'excludedSecretTablesAreEmpty':True}))
