import {locatePart} from './vehicle-map.ts';
export type Vec3=[number,number,number];
export type Side='all'|'left'|'right';
export type Axle='all'|'front'|'rear';
export type PartPlacement={tag:string,zone:string,anchors:{position:Vec3,label:string,es:string}[],multiple:boolean,assembly:boolean};
const one=(tag:string,zone:string,p:Vec3,en:string,es:string,assembly=false):PartPlacement=>({tag,zone,anchors:[{position:p,label:en,es}],multiple:false,assembly});
/** Reference coordinates in metres. These locate a component in this original teaching model,
 * never claim OEM fitment, exact mounting, torque or model-specific geometry. Front is -X. */
export function partPlacement(part:any,vehicle:any={},side:Side='all',axle:Axle='all'):PartPlacement{
 const n=String(part?.name||'').toLowerCase(),category=String(part?.category||''),zone=locatePart(part);
 if(!part)return {tag:'',zone:'whole',anchors:[],multiple:false,assembly:false};
 if(category==='Paint & refinishing')return {tag:'body',zone:'body',anchors:[],multiple:true,assembly:true};
 if(/brake master|brake booster|abs module|brake fluid/.test(n))return one('brakeHydraulics','engine',[-.58,.91,-.28],'Brake hydraulic assembly near the bulkhead','Conjunto hidráulico de frenos junto al cortafuegos',true);
 if(/steering column|ignition switch|ignition lock|clock spring|instrument cluster|dashboard/.test(n))return one('dashboard','cabin',[-.28,1.02,0],'Dashboard / steering assembly','Tablero / conjunto de dirección',true);
 if(/steering rack|steering gear|inner tie|outer tie/.test(n))return one('steering','frontAxle',[-1.3,.42,0],'Front steering linkage','Mecanismo delantero de dirección',true);
 const wheels=/brake pad|brake rotor|brake drum|brake shoe|brake caliper|brake hose|wheel cylinder|wheel speed|wheel hub|wheel bearing|wheel stud|lug nut|^wheel$|^tire$|tpms|strut|shock absorber|coil spring|leaf spring|air suspension bag|control arm|ball joint|steering knuckle|sway bar|cv axle|cv boot|axle shaft/.test(n);
 if(wheels){const inferredAxle=/front/.test(n)?'front':/rear|leaf spring/.test(n)?'rear':axle;const inferredSide=/left/.test(n)?'left':/right/.test(n)?'right':side;const brake=/brake|wheel cylinder/.test(n),susp=/strut|shock|spring|control arm|ball joint|knuckle|sway|suspension/.test(n);const tag=brake?'brakes':susp?'suspension':'wheels';const anchors:PartPlacement['anchors']=[];for(const [a,x]of [['front',-1.38],['rear',1.38]] as const)for(const [s,z]of [['left',-.96],['right',.96]] as const){if(inferredAxle!=='all'&&a!==inferredAxle||inferredSide!=='all'&&s!==inferredSide)continue;anchors.push({position:[x,susp ? .72 : .43,z],label:(a==='front'?'Front':'Rear')+' · '+s,es:(a==='front'?'Delantero':'Trasero')+' · '+(s==='left'?'izquierdo':'derecho')});}return {tag,zone:inferredAxle==='front'?'frontAxle':inferredAxle==='rear'?'rearAxle':'wheels',anchors,multiple:anchors.length>1,assembly:!brake&&!/^tire$|^wheel$/.test(n)};}
 if(/radiator (core )?support/.test(n))return one('frontBumper','front',[-2.12,.7,0],'Front radiator support structure','Estructura frontal de soporte del radiador',true);
 if(/radiator|condenser|intercooler|cooling fan|fan clutch|transmission cooler/.test(n))return one(/condenser/.test(n)?'condenser':/fan/.test(n)?'fan':'radiator','cooling',[-1.98,.75,0],'Front cooling module','Módulo frontal de enfriamiento',true);
 if(/headlight|fog light|turn signal/.test(n)){const anchors:PartPlacement['anchors']=[{position:[-2.22,.77,-.65],label:'Front left lamp assembly',es:'Conjunto de luz delantero izquierdo'},{position:[-2.22,.77,.65],label:'Front right lamp assembly',es:'Conjunto de luz delantero derecho'}];return {tag:'frontLamps',zone:'front',anchors,multiple:true,assembly:true};}
 if(/taillight|license plate light/.test(n))return one('rearLamps','rear',[2.23,.8,.62],'Rear lamp assembly','Conjunto de luz trasero',true);
 if(/front bumper|grille|radiator.*support|bumper absorber|bumper bracket/.test(n))return one('frontBumper','front',[-2.34,.56,0],'Front bumper / support structure','Parachoques delantero / estructura de soporte',true);
 if(/rear bumper/.test(n))return one('rearBumper','rear',[2.34,.56,0],'Rear bumper structure','Estructura del parachoques trasero',true);
 if(/hood/.test(n))return one('hood','body',[-1.35,.86,0],'Hood panel and latch area','Panel y zona del cierre del capó',true);
 if(/fender/.test(n))return one('body','body',[-1.3,.86,/right/.test(n)?.92:-.92],'Front fender area','Zona del guardafango delantero',true);
 if(/roof|headliner|sunroof/.test(n))return one('roof','body',[.35,1.43,0],'Roof / headliner assembly','Conjunto de techo / revestimiento',true);
 if(/windshield|wiper blade|adas camera/.test(n))return one('windshield','body',[-.55,1.15,0],'Windshield / cowl area','Zona del parabrisas / rejilla inferior',true);
 if(/rear glass|trunk|tailgate|liftgate|backup camera/.test(n))return one('rearBody','rear',[2.06,1,0],'Rear body / lid / liftgate','Carrocería trasera / tapa / compuerta',true);
 if(/door|mirror|quarter|rocker panel|weatherstrip/.test(n))return one('doors','body',[.35,1,/right/.test(n)?.95:-.95],'Door / side-body assembly; verify the side','Puerta / lateral; confirme el lado',true);
 if(/seat|airbag|console|carpet/.test(n))return one('interior','cabin',[.35,.95,0],'Interior seating / safety assembly','Conjunto interior de asientos / seguridad',true);
 if(/evaporator|heater core|blower|blend door|hvac control|cabin air filter|expansion valve/.test(n))return one('hvac','cabin',[-.4,.88,.25],'HVAC housing behind the dashboard','Caja de climatización detrás del tablero',true);
 if(/a\/c compressor|power steering pump/.test(n))return one('accessories','engine',[-1.48,.56,.4],'Engine-driven accessories','Accesorios del motor',true);
 if(/battery cable|battery terminal|^battery$/.test(n))return one('battery','engine',[-.92,.91,-.55],'12 V battery reference area; actual placement varies','Zona de referencia de batería de 12 V; varía por vehículo',true);
 if(/alternator|serpentine|belt tensioner|idler pulley|harmonic balancer/.test(n))return one('alternator','engine',[-1.58,.77,.42],'Accessory drive at the engine','Transmisión de accesorios del motor',true);
 if(/starter/.test(n))return one('starter','transmission',[-.65,.5,.23],'Engine / transmission bellhousing','Campana entre motor y transmisión',true);
 if(/high voltage battery|hybrid battery|high voltage cable/.test(n))return one('hvBattery','underbody',[.15,.3,0],'High-voltage battery reference assembly; confirm OEM layout','Conjunto de referencia de batería de alto voltaje; confirme OEM',true);
 if(/drive motor|inverter|dc-dc|onboard charger|electric coolant/.test(n))return one('driveMotor','engine',[-1.2,.58,0],'Electric powertrain reference module','Módulo de referencia de propulsión eléctrica',true);
 if(/charge port/.test(n))return one('body','body',[1.25,.88,-.93],'Charge inlet; its body-panel position varies','Puerto de carga; su ubicación en carrocería varía',true);
 if(/fuel pump|fuel tank|filler|fuel cap|charcoal|evap vent|def pump/.test(n))return one('fuelTank','underbody',[.95,.35,0],'Fuel tank / filler system reference area','Zona de referencia de tanque / llenado',true);
 if(/fuel line|brake line|parking brake/.test(n))return one('underbody','underbody',[.1,.25,.4],'Routing underneath the vehicle','Recorrido debajo del vehículo',true);
 if(/muffler|resonator/.test(n))return one('muffler','underbody',[1.78,.27,.4],'Rear exhaust silencer','Silenciador trasero',true);
 if(/catalytic|oxygen sensor|particulate|nox sensor/.test(n))return one('catalyst','underbody',[-.45,.3,.32],'Exhaust treatment assembly; sensor count/location varies','Conjunto de tratamiento de escape; sensores y ubicación varían',true);
 if(/exhaust pipe|exhaust hanger|exhaust flex/.test(n))return one('exhaust','underbody',[.4,.25,.4],'Underbody exhaust routing','Recorrido inferior del escape',true);
 if(/drive shaft|u-joint|center support|transfer case/.test(n))return one('driveline','underbody',[.25,.36,0],'Longitudinal driveline reference','Referencia de transmisión longitudinal',true);
 if(/differential|gear oil/.test(n))return one('differential','rearAxle',[1.38,.43,0],'Differential reference; drivetrain-dependent','Referencia de diferencial; depende de la tracción',true);
 if(/transmission|clutch|flywheel|flexplate|torque converter/.test(n))return one('transmission','transmission',[-.55,.5,0],'Transmission assembly reference','Referencia del conjunto de transmisión',true);
 if(/washer|coolant reservoir/.test(n))return one('reservoir','engine',[-1.25,.92,.67],'Engine-bay reservoir reference','Referencia de depósito en el compartimiento del motor',true);
 if(/fuse|relay|control module|wiring|ground/.test(n))return one('electrical','engine',[-.74,.94,-.57],'Electrical distribution reference; locations vary','Referencia de distribución eléctrica; las ubicaciones varían',true);
 if(zone==='engine'||category==='Engine'||category==='Cooling'||category==='Fuel & air'||category==='Ignition & electrical'||/engine oil|engine coolant|air filter|engine air/.test(n))return one('engine','engine',[-1.25,.82,0],'Inside / attached to the engine assembly','Dentro / unido al conjunto del motor',true);
 if(zone==='cabin')return one('interior','cabin',[0,1,0],'Cabin assembly reference','Referencia del conjunto de cabina',true);
 return {tag:zone==='body'?'body':'',zone,anchors:[],multiple:true,assembly:true};
}
