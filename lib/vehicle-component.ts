import {buildVehicleScene} from './vehicle-scene.ts';
import {meshBuilder,fitAssembly,type Face} from './vehicle-geometry.ts';
import {engineAssembly,alternatorAssembly,brakeAssembly} from './vehicle-engine.ts';
import type {BodyType} from './vehicle-map.ts';
import type {Vec3} from './vehicle-spatial.ts';
import {universalJoint,cvHalfShaft,driveShaft,differentialAssembly,type DriveLayout} from './vehicle-underbody.ts';
export const inspectableComponents=[
 {tag:'windshield',name:'Windshield and cowl',es:'Parabrisas y vierteaguas',part:'Windshield',at:[-.55,1.3,0]},
 {tag:'rearLamps',name:'Rear lighting',es:'Luces traseras',part:'Taillight assembly',at:[2.2,.8,.65]},
 {tag:'engine',name:'Complete engine assembly',es:'Conjunto completo del motor',part:'Engine assembly',at:[-1.28,1.08,0]},
 {tag:'driveMotor',name:'Electric drive motor',es:'Motor de propulsión eléctrica',part:'Electric drive motor',at:[-1.2,.85,0]},
 {tag:'radiator',name:'Radiator',es:'Radiador',part:'Radiator',at:[-2,.84,0]},
 {tag:'alternator',name:'Alternator',es:'Alternador',part:'Alternator',at:[-1.75,.7,.47]},
 {tag:'battery',name:'12 V battery',es:'Batería de 12 V',part:'Battery',at:[-.94,1.08,-.61]},
 {tag:'brakes',name:'Brake assembly',es:'Conjunto de freno',part:'Brake rotor',at:[-1.38,.43,-1]},
 {tag:'suspension',name:'Suspension',es:'Suspensión',part:'Strut assembly',at:[-1.38,.85,.67]},
 {tag:'transmission',name:'Transmission',es:'Transmisión',part:'Automatic transmission assembly',at:[-.65,.55,0]},
 {tag:'hvBattery',name:'High-voltage battery',es:'Batería de alto voltaje',part:'High voltage battery',at:[.15,.3,0]},
 {tag:'wheels',name:'Wheel and tire',es:'Rueda y neumático',part:'Wheel',at:[1.38,.43,-1]},
 {tag:'roof',name:'Roof and panoramic glass',es:'Techo y cristal panorámico',part:'Roof panel',at:[.4,1.8,0]},
 {tag:'doors',name:'Door and mirror',es:'Puerta y espejo',part:'Door shell',at:[.45,1.15,-.9]},
 {tag:'frontLamps',name:'LED lighting',es:'Iluminación LED',part:'Headlight assembly',at:[-2.32,.91,.7]},
 {tag:'hvac',name:'Climate system',es:'Climatización',part:'Heater core',at:[-.45,.86,.3]},
 {tag:'fuelTank',name:'Fuel tank',es:'Tanque de combustible',part:'Fuel tank',at:[.96,.36,-.39]},
 {tag:'hood',name:'Hood',es:'Capó',part:'Hood',at:[-1.55,1.06,0]},
 {tag:'rearBody',name:'Rear body / tailgate',es:'Parte trasera / compuerta',part:'Tailgate',at:[2.1,1.05,0]},
 {tag:'frontBumper',name:'Front bumper and grille',es:'Parachoques y parrilla frontal',part:'Front bumper cover',at:[-2.34,.65,0]},
 {tag:'dashboard',name:'Dashboard',es:'Tablero',part:'Instrument cluster',at:[-.3,1.12,0]},
 {tag:'interior',name:'Seating',es:'Asientos',part:'Seat assembly',at:[.2,1,0]},
 {tag:'body',name:'Body structure',es:'Estructura de carrocería',part:'Front fender',at:[-1.3,.95,-.9]},
 {tag:'condenser',name:'A/C condenser',es:'Condensador A/C',part:'A/C condenser',at:[-2.1,.72,0]},
 {tag:'fan',name:'Cooling fan',es:'Ventilador de enfriamiento',part:'Cooling fan assembly',at:[-1.91,.73,0]},
 {tag:'starter',name:'Starter motor',es:'Motor de arranque',part:'Starter motor',at:[-.7,.43,.3]},
 {tag:'reservoir',name:'Fluid reservoir',es:'Depósito de fluido',part:'Coolant reservoir',at:[-1.13,1,.67]},
 {tag:'brakeHydraulics',name:'Brake hydraulics',es:'Hidráulica de frenos',part:'Brake master cylinder',at:[-.6,.95,-.3]},
 {tag:'electrical',name:'Electrical distribution',es:'Distribución eléctrica',part:'Fuse box',at:[-.66,.94,-.64]},
 {tag:'exhaust',name:'Exhaust system',es:'Sistema de escape',part:'Exhaust pipe',at:[.75,.23,.52]},
 {tag:'muffler',name:'Muffler',es:'Silenciador',part:'Muffler',at:[1.67,.29,.35]},
 {tag:'catalyst',name:'Catalytic converter',es:'Convertidor catalítico',part:'Catalytic converter',at:[-.44,.28,.35]},
 {tag:'differential',name:'Differential',es:'Diferencial',part:'Differential',at:[1.38,.43,0]},
 {tag:'driveline',name:'Driveline',es:'Cardán / eje de transmisión',part:'Drive shaft',at:[.4,.36,0]},
 {tag:'steering',name:'Steering linkage',es:'Mecanismo de dirección',part:'Steering rack',at:[-1.38,.4,0]},
 {tag:'accessories',name:'Engine accessories',es:'Accesorios del motor',part:'A/C compressor',at:[-1.56,.5,.49]},
 {tag:'oilPan',name:'Engine oil pan',es:'Cárter de aceite',part:'Oil pan',at:[-1.28,.16,0]},
 {tag:'uJoint',name:'Propeller-shaft universal joint',es:'Cruceta del cardán',part:'U-joint',at:[1.06,.35,0]},
 {tag:'cvAxle',name:'CV half-shaft',es:'Flecha / semieje homocinético',part:'CV axle',at:[-1.38,.43,-.58]},
 {tag:'transferCase',name:'Transfer case',es:'Caja de transferencia',part:'Transfer case',at:[-.27,.39,-.14]},
 {tag:'brakeLines',name:'Brake lines',es:'Tuberías de freno',part:'Brake line',at:[.2,.4,-.68]},
 {tag:'fuelLines',name:'Fuel lines',es:'Líneas de combustible',part:'Fuel line',at:[.2,.4,-.6]},
 {tag:'parkingBrake',name:'Parking brake',es:'Freno de estacionamiento',part:'Parking brake cable',at:[.85,.4,.3]},
 {tag:'floorPan',name:'Underfloor structure',es:'Piso y estructura inferior',part:'Underbody shield',at:[.45,.55,0]},
 {tag:'underbody',name:'Chassis rails and crossmembers',es:'Bastidor y travesaños',part:'Frame rail',at:[0,.35,0]},
 {tag:'rearBumper',name:'Rear bumper',es:'Parachoques trasero',part:'Rear bumper cover',at:[2.32,.47,0]},
] as const;
export function buildComponentPreview(part:any,tag:string,type:BodyType,ev:boolean,drive:DriveLayout='awd'):{faces:Face[],specific:boolean,features:[string,string][],family:string}{
 const m=meshBuilder(),{box,cylinder,lathe,tube}=m,n=String(part?.name||'').toLowerCase();let specific=true,family=tag;let features:[string,string][]=[];
 if(tag==='oilPan'){m.faces.push(...buildVehicleScene(type,ev,drive).filter(f=>f.tag==='oilPan'));specific=/^oil pan$/.test(n);features=[['Lower sump and cooling ribs','Depósito inferior y nervaduras'],['Drain-plug reference','Referencia del tapón de drenaje']];}
 else if(tag==='uJoint'){universalJoint(m);specific=/u-joint|universal joint/.test(n);features=[['Cross and bearing caps','Cruz y tapas de los rodamientos'],['Yokes and flanges','Horquillas y bridas']];}
 else if(tag==='cvAxle'){cvHalfShaft(m,0,1,0);specific=/cv axle/.test(n);features=[['Half-shaft bar','Eje del semieje'],['Inner and outer CV joint housings','Alojamientos de juntas homocinéticas'],['Bellows boots and clamps','Guardapolvos y abrazaderas']];}
 else if(tag==='driveline'){driveShaft(m);specific=/drive shaft/.test(n);features=[['Tubular propeller shaft','Cardán tubular'],['Universal joints and flange connections','Crucetas y conexiones de brida']];}
 else if(tag==='differential'){differentialAssembly(m,[0,0,0]);specific=/differential/.test(n)&&!/(seal|oil)/.test(n);features=[['Differential housing','Carcasa del diferencial'],['Pinion connection and side outputs','Conexión del piñón y salidas laterales']];}
 else if(/^(piston|connecting rod)$/.test(n)){family='piston';lathe([0,.3,0],[[-.18,.24],[.1,.24],[.11,.2],[.15,.2],[.16,.24],[.2,.24]],'#bdc8ce','engine','y',28);for(const y of [.03,.09,.15])lathe([0,.3,0],[[y,.241],[y+.012,.241]],'#455d6a','engine','y',28);cylinder([0,.19,0],.065,.52,'#a4b6c2','engine','z',16);tube([[0,.2,0],[0,-.4,0]],.065,'#8dabbc','engine',12);lathe([0,-.49,0],[[-.055,.09],[-.055,.17],[.055,.17],[.055,.09]],'#b6c8cd','engine','z',24);features=[['Piston crown and ring grooves','Corona y ranuras de anillos'],['Wrist pin','Pasador del pistón'],['Connecting rod and big end','Biela y cabeza de biela']];}
 else if(/^spark plug$/.test(n)){family='spark plug';lathe([0,0,0],[[-.34,.02],[-.31,.055],[-.08,.055],[-.04,.075],[.02,.075]],'#bcc9d0','engine','y',16);for(let i=0;i<12;i++)lathe([0,0,0],[[-.3+i*.018,.058],[-.296+i*.018,.058]],'#6f8997','engine','y',16);cylinder([0,.02,0],.09,.08,'#aab9bf','engine','y',6);lathe([0,0,0],[[.06,.05],[.13,.05],[.14,.064],[.17,.064],[.18,.05],[.21,.05],[.22,.064],[.25,.064],[.26,.045],[.34,.045]],'#e9e4d4','engine','y',16);cylinder([0,.38,0],.025,.09,'#b3bfca','engine','y',12);tube([[.045,-.3,0],[.045,-.36,0],[.005,-.36,0]],.012,'#a2b2bd','engine');features=[['Terminal and ceramic insulator','Terminal y aislador cerámico'],['Hex and threaded shell','Hexágono y cuerpo roscado'],['Electrodes','Electrodos']];}
 else if(/oil filter|fuel filter/.test(n)){family='filter';lathe([0,0,0],[[-.27,.12],[-.24,.17],[.2,.17],[.24,.14]],'#327c86','engine','y',26);cylinder([0,.24,0],.145,.025,'#c1cbd0','engine','y',24);cylinder([0,.26,0],.035,.02,'#203b49','engine','y',16);for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder([Math.cos(a)*.09,.26,Math.sin(a)*.09],.014,.01,'#1c3442','engine','y',8);}features=[['Filter housing','Carcasa del filtro'],['Mounting plate and seal area','Placa y zona de sellado'],['Inlet and outlet passages','Pasos de entrada y salida']];}
 else if(/air filter|cabin.*filter/.test(n)){family='air filter';box([0,0,0],[.7,.09,.46],'#263d4b','engine');for(let i=0;i<24;i++)box([-.32+i*.028,.06,0],[.012,.09,.4],'#d5cbac','engine');features=[['Pleated filter media','Medio filtrante plegado'],['Perimeter seal','Sello perimetral']];}
 else if(/brake pad|brake shoe/.test(n)){family='brake pads';for(const z of [-.12,.12]){box([0,0,z],[.5,.24,.045],'#7d95a4','brakes');box([0,.015,z+Math.sign(z)*.03],[.43,.18,.035],'#384851','brakes');box([0,.015,z+Math.sign(z)*.05],[.012,.18,.006],'#152c38','brakes');for(const x of [-.26,.26])box([x,0,z],[.045,.07,.025],'#b9c5cb','brakes');}features=[['Friction material','Material de fricción'],['Backing plates and tabs','Placas y lengüetas de soporte'],['Illustrative pad pair','Par ilustrativo de pastillas']];}
 else if(/shock|strut|coil spring/.test(n)){specific=/strut$|shock absorber$/.test(n);family='strut';cylinder([0,0,0],.07,.7,'#6d8c9f','suspension','y',18);cylinder([0,.38,0],.025,.4,'#d1d9df','suspension','y',16);cylinder([0,.58,0],.15,.055,'#253c4b','suspension','y',20);cylinder([0,.05,0],.17,.035,'#8ba1af','suspension','y',20);const path:Vec3[]=[];for(let i=0;i<97;i++){const a=i*Math.PI/8;path.push([Math.cos(a)*.14,.1+i*.0044,Math.sin(a)*.14]);}tube(path,.014,'#d0ac61','suspension',7);box([0,-.34,0],[.19,.14,.09],'#6d8799','suspension');features=[['Damper body and piston rod','Cuerpo amortiguador y vástago'],['Coil spring and seat','Resorte y asiento'],['Upper mount','Soporte superior']];}
 else if(tag==='engine'){specific=/engine assembly|complete engine|long block|short block/.test(n);engineAssembly(m,[0,0,0]);features=[['Illustrative inline-four turbo layout','Distribución ilustrativa de 4 cilindros turbo'],['Valve cover and ignition coils','Tapa de válvulas y bobinas'],['Intake runners and plenum','Conductos y colector de admisión'],['Turbo / exhaust manifold','Turbo / múltiple de escape'],['Block, oil pan and accessory drive','Bloque, cárter y transmisión de accesorios']];}
 else if(tag==='alternator'){specific=/alternator/.test(n);alternatorAssembly(m);features=[['Vented housing','Carcasa ventilada'],['Pulley','Polea'],['Mounting ears','Orejas de montaje']];}
 else if(tag==='brakes'){specific=/rotor|caliper/.test(n);brakeAssembly(m);features=[['Brake rotor and hub','Disco y cubo'],['Caliper and friction pad area','Pinza y zona de pastillas']];}
 else {specific=false;let faces=buildVehicleScene(type,ev,drive).filter(f=>f.tag===tag||(tag==='body'&&f.kind==='body'));if(['wheels','suspension'].includes(tag))faces=faces.filter(f=>f.points.every(p=>p[0]<0&&p[2]<0));if(tag==='doors')faces=faces.filter(f=>f.points.every(p=>p[2]<0));m.faces.push(...faces);features=[['Isolated reference assembly','Conjunto de referencia aislado'],['Rotate to inspect all sides','Gire para inspeccionar todos los lados']];}
 return {faces:fitAssembly(m.faces),specific,features,family};
}
