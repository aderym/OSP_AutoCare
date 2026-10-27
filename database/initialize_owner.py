"""Set an OSP password only in a copied local runtime SQLite database."""
import getpass,hashlib,os,secrets,sqlite3,sys
from pathlib import Path
if len(sys.argv)!=2:
    raise SystemExit('Usage: python3 database/initialize_owner.py /new/runtime/osp-autocare.sqlite')
target=Path(sys.argv[1]).resolve()
if not target.is_file() or target==(Path(__file__).resolve().parent/'osp-autocare.sqlite'):
    raise SystemExit('Copy the snapshot to a new runtime path first. The repository snapshot is never modified.')
password=os.environ.get('BOOTSTRAP_ADMIN_PASSWORD') or getpass.getpass('Local OSP password (hidden, 6+ characters): ')
if not 6<=len(password)<=128:
    raise SystemExit('Password must have 6–128 characters.')
db=sqlite3.connect(target)
row=db.execute("SELECT id,password FROM users WHERE username='osp' AND role='owner'").fetchone()
if not row or row[1]:
    db.close()
    raise SystemExit('OSP owner missing or already initialized; no credential was changed.')
salt=secrets.token_hex(16)
digest=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),100000).hex()
db.execute('UPDATE users SET password=?,active=1 WHERE id=?',(salt+':'+digest,row[0]))
db.commit();db.close()
print('Local OSP owner initialized. The published site and repository snapshot are unchanged.')
