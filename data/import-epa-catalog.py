"""Build local make/model/year/engine menus from the official EPA/DOE CSV ZIP."""
import csv,io,zipfile,json,sys,pathlib,hashlib,datetime
archive=pathlib.Path(sys.argv[1]);years={};count=0
with zipfile.ZipFile(archive) as z:
 with z.open('vehicles.csv') as f:
  for r in csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig')):
   year,make,model=r['year'],r['make'].strip(),r['model'].strip()
   if not(year and make and model):continue
   engine=' / '.join(v for v in [(r.get('displ') or '')+' L' if r.get('displ') else '',(r.get('cylinders') or '')+' cyl' if r.get('cylinders') else '',r.get('fuelType1','')] if v)
   cfg={'id':r['id'],'engine':engine,'transmission':r.get('trany',''),'drive':r.get('drive',''),'fuelType':r.get('fuelType1',''),'bodyClass':r.get('VClass','')}
   entry=years.setdefault(year,{}).setdefault(make.lower(),{'name':make,'models':{}})
   entry['models'].setdefault(model,[]).append(cfg);count+=1
out=pathlib.Path('public/vehicle-catalog');out.mkdir(exist_ok=True)
for year,values in years.items():
 (out/(year+'.json')).write_text(json.dumps(values,separators=(',',':')))
index={'source':'https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip','documentation':'https://www.fueleconomy.gov/feg/ws/','downloaded':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'records':count,'modelYearMakeCombinations':sum(len(m['models']) for y in years.values() for m in y.values()),'years':sorted(years,reverse=True),'makesByYear':{y:sorted(v['name'] for v in values.values()) for y,values in years.items()}}
(out/'index.json').write_text(json.dumps(index,separators=(',',':')))
pathlib.Path('data/catalog/epa-catalog-metadata.json').write_text(json.dumps({k:v for k,v in index.items() if k!='makesByYear'},indent=2))
print(json.dumps({k:v for k,v in index.items() if k not in ['makesByYear','source_sha256','downloaded']},indent=2))
