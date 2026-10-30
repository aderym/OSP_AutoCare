#!/usr/bin/env python3
"""Package tracked application files and the compiled standalone frontend."""
import argparse,datetime,hashlib,json,pathlib,subprocess,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);parser.add_argument('--commit',default='');args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parent.parent
files=set(subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0'))-{''}
build=root/'standalone-dist'
if not (build/'index.html').is_file():raise SystemExit('Build standalone-dist first')
files.update(str(p.relative_to(root)) for p in build.rglob('*') if p.is_file())
for f in files:
 p=pathlib.PurePosixPath(f)
 if '.git' in p.parts or 'node_modules' in p.parts or 'runtime' in p.parts or (p.name.startswith('.env') and p.name!='.env.example') or p.name.startswith('.dev.vars'):
  raise SystemExit('Private or runtime file cannot be packaged: '+f)
entries=[{'path':f,'bytes':(root/f).stat().st_size,'sha256':hashlib.sha256((root/f).read_bytes()).hexdigest()} for f in sorted(files)]
manifest={'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit':args.commit or subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'source_tree':subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=root,text=True).strip(),'files':entries,'database_note':'Fixed sanitized initial snapshots; not a live database synchronization.','excluded':['real credentials','runtime databases','sessions','node_modules','.git']}
out=pathlib.Path(args.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for entry in entries:z.write(root/entry['path'],'OSP_AutoCare/'+entry['path'])
 z.writestr('OSP_AutoCare/DELIVERY-MANIFEST.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for e in entries:assert hashlib.sha256(z.read('OSP_AutoCare/'+e['path'])).hexdigest()==e['sha256']
print(json.dumps({'archive':str(out),'file_count':len(entries)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source_tree':manifest['source_tree']}))
