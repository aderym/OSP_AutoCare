// Original transparent vector references. Generic assemblies, never OEM fitment data.
export type AssemblyPiece = {name:string; x:number; y:number; path:string};
const piece=(name:string,x:number,y:number,path:string):AssemblyPiece=>({name,x,y,path});
const gear='M-28-14l10-4 4-12h16l4 12 10 4 12-4 8 14-9 9v12l9 9-8 14-12-4-10 4-4 12h-16l-4-12-10-4-12 4-8-14 9-9v-12l-9-9 8-14z M-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0';
const spring='M-15-38h30M0-38v12l-20 9 40 10-40 10 40 10-40 10 20 9v12M-15 44h30';
const disc='M-36 0a36 36 0 1 0 72 0a36 36 0 1 0-72 0 M-15 0a15 15 0 1 0 30 0a15 15 0 1 0-30 0 M-5-25h10 M-5 25h10 M-25-5v10 M25-5v10';
const radiator='M-48-32h96v64h-96z M-38-32v64 M-28-32v64 M-18-32v64 M-8-32v64 M2-32v64 M12-32v64 M22-32v64 M32-32v64 M42-32v64 M-55-20h7 M48 20h12';
const motor='M-38-24h64l16 14v35h-80z M-38-12h80 M-24 25v10 M22 25v10 M-38 0h-15v15h15 M42 0h13v10h-13 M-25-24v-9h40v9 M-15-10v28 M0-10v28 M15-10v28';
const battery='M-36-25h72v55h-72z M-25-25v-9h14v9 M12-25v-9h14v9 M-26-8h15 M-19-15v14 M14-8h15 M-36 5h72';
const filter='M-28-30q28-14 56 0v55q-28 16-56 0z M-28-30q28 15 56 0 M-20-18v38 M-10-15v38 M0-13v38 M10-15v38 M20-18v38';
const pump='M-28-20h45l20 20-20 25h-45z M-14 0a15 15 0 1 0 30 0a15 15 0 1 0-30 0 M-28-10h-20v-22 M17 25v16h25';
const arm='M-45-15l85-10 8 15-85 35z M-40-6a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M32-10a5 5 0 1 0 10 0a5 5 0 1 0-10 0';
const lamp='M-40-20q40-20 80 0v38q-40 20-80 0z M-28-20v42 M-12-26v52 M8-28v54 M26-24v48';
export const partsAssemblies:Record<string,AssemblyPiece[]>={
 'Engine':[
 piece('Valve cover',150,60,'M-65 0l20-24h95l20 24-20 16h-95z M-45 0h95 M-26-15v22 M0-15v22 M26-15v22'),
 piece('Cylinder head',150,135,'M-65-18h130v36h-130z M-45-5h15v14h-15z M-8-5h15v14h-15z M30-5h15v14h-15z'),
 piece('Piston',340,90,'M-24-30q24-12 48 0v32q-24 12-48 0z M-24-20q24 12 48 0 M-24-12q24 12 48 0 M-8 8v48h16v-48 M-13 58a13 13 0 1 0 26 0a13 13 0 1 0-26 0'),
 piece('Engine block',150,225,'M-65-35h130v70h-130z M-65-35l16-16h130l-16 16 M-40-20a12 12 0 1 0 0 24a12 12 0 1 0 0-24 M0-20a12 12 0 1 0 0 24a12 12 0 1 0 0-24 M40-20a12 12 0 1 0 0 24a12 12 0 1 0 0-24'),
 piece('Crankshaft',330,230,'M-60 0h20v-20h20v40h20v-40h20v40h20v-40h20v20h20 M-60 10h20v-20h10v40h40v-40h10v40h40v-20h10'),
 piece('Oil pan',150,325,'M-65-15h130l-15 40h-100z M-65-15l10-10h110l10 10 M-50-5h100 M-30 5v12 M0 5v12 M30 5v12')],
 'Cooling':[piece('Radiator',135,140,radiator),piece('Water pump',335,135,pump),piece('Thermostat',340,270,'M-26 8h52 M-16 8v-20q16-28 32 0v20 M-8 10v22h16v-22'),piece('Upper radiator hose',220,65,'M-85 0h100q30 0 30 30v16h15v-16q0-45-45-45h-100z'),piece('Cooling fan',130,280,'M-10-10q-30-60-45-20q-10 22 45 30q-40 30-10 45q25 10 30-40q50 30 50-5q0-28-50-10q25-50-10-45q-20 0-10 45z')],
 'Fuel & air':[piece('Air filter housing',90,95,filter),piece('Throttle body',235,100,pump),piece('Fuel rail',340,210,'M-55-25h110v20h-10v55h-15v-55h-20v55h-15v-55h-20v55h-15v-55h-15z'),piece('Fuel pump',100,260,pump),piece('Fuel injector',245,290,'M-8-35h16v18h10v30h-10v22h-16v-22h-10v-30h10z M-25-20h12 M-4 35v15')],
 'Ignition & electrical':[piece('Battery',95,110,battery),piece('Alternator',245,110,motor),piece('Starter motor',365,230,motor),piece('Spark plug',110,280,'M-8-45h16v20h7v25h-30v-25h7z M-10 0h20v30h-20z M-10 8h20 M-10 15h20 M0 30v12h10v-8'),piece('Ignition coil',245,270,'M-25-25h50v40h-50z M-10 15v35h20v-35 M-25-15h50 M-25-5h50')],
 'Exhaust & emissions':[piece('Exhaust pipe',100,100,'M-60-20h35q20 0 20 20t20 20h45v15h-45q-35 0-35-35q0-5-5-5h-35z M-60-25v25 M60 15v25'),piece('Catalytic converter',260,170,'M-60-8h25l15-20h40l15 20h25v16h-25l-15 20h-40l-15-20h-25z M-15-20v40 M0-20v40 M15-20v40'),piece('Muffler',340,290,'M-60-7h25v-20h70v20h25v14h-25v20h-70v-20h-25z M-20-27v54 M20-27v54'),piece('Oxygen sensor',115,280,'M-8-25h16v50h-16z M-15-10h30v15h-30z M0-25v-25h30')],
 'Transmission & drivetrain':[piece('Automatic transmission',100,120,'M-50-35h60l35 25v45h-70l-25-20z M-35-35v70 M-20-35v70 M-5-35v70 M45 0h25v15h-25'),piece('Drive shaft',260,140,'M-70-8h140v16h-140z M-55-18v36 M55-18v36 M-70-18h15 M55-18h15'),piece('Differential',330,275,gear),piece('CV axle',130,280,'M-65-8h25l10-15h25l10 15h60v16h-60l-10 15h-25l-10-15h-25z M-30-23v46 M-20-23v46 M-10-23v46')],
 'Suspension & steering':[piece('Front strut',100,115,spring),piece('Control arm',270,100,arm),piece('Outer tie rod',330,220,'M-70-6h120v12h-120z M-70-6l-10-12h-12v36h12l10-12 M50-6h18v12h-18 M-50-10v20 M-40-10v20'),piece('Steering rack',170,290,'M-90-8h45v-10h90v10h45v16h-45v10h-90v-10h-45z M-30-18v36 M30-18v36'),piece('Steering knuckle',380,310,'M-12-35h24l8 20 20 8v18l-20 5-8 25h-24l-8-25-20-5v-18l20-8z M-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0')],
 'Brakes':[piece('Brake rotor',140,150,disc),piece('Brake caliper',270,100,'M-30-30h55l15 15v45h-25v-35h-20v35h-25z M-30-20h55 M-10-30v-12h20v12'),piece('Front brake pad set',350,210,'M-40-20q40-30 80 0v35q-40-20-80 0z M-30-15q30-20 60 0'),piece('Brake master cylinder',140,300,'M-55-10h85v20h-85z M-30-10v-30h45v30 M30-5h25v10h-25'),piece('Brake hose',335,310,'M-55-20q55-40 80 0t-10 45 M-58-28v16 M10 18l12 12')],
 'HVAC':[piece('A/C compressor',110,120,motor),piece('A/C condenser',300,110,radiator),piece('A/C evaporator',310,270,radiator),piece('Blower motor',110,280,disc)],
 'Body & collision':[piece('Hood',130,90,'M-65 20l20-55h90l20 55z M-45-35l10 55 M45-35l-10 55'),piece('Front bumper cover',310,95,'M-65-10q65 25 130 0v25q-65 30-130 0z M-45 5h25 M20 5h25'),piece('Left front fender',110,250,'M-60 25v-45l35-15h70l15 15v45h-15q-20-60-60 0z'),piece('Front door shell',300,245,'M-60 35v-80h90l30 50v30z M-45-35v35h85l-20-35z M15 10h20'),piece('Headlight assembly',220,340,lamp)],
 'Interior & safety':[piece('Seat assembly',110,150,'M-20-60h40l10 85h-60z M-40 25h90v25h-90z M-25 50v20 M35 50v20'),piece('Steering wheel',300,100,disc),piece('Airbag module',300,240,'M-40 0q0-40 40-40t40 40q0 40-40 40t-40-40z M-15-15h30v30h-30z'),piece('Seat belt',150,320,'M-55-20l100 20v20l-100-20z M30-5h30v30h-30z')],
 'Maintenance & fluids':[piece('Engine oil filter',100,120,filter),piece('Engine air filter',280,120,radiator),piece('Engine oil',110,280,'M-28-35h36v-15h20v30l12 15v50h-68z M-15-10h40v35h-40z'),piece('Wiper blade',310,290,'M-70-5h140v10h-140z M-50-5l20-20h60l20 20 M0-25v-20')],
 'Hybrid & electric':[piece('High voltage battery',140,115,'M-65-30h130v60h-130z M-50-20h20v40h-20z M-20-20h20v40h-20z M10-20h20v40h-20z M40-20h15v40h-15z'),piece('Inverter',340,110,battery),piece('Drive motor',135,285,motor),piece('Charge port',335,280,'M-30-30h60v60h-60z M-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0 M-10-8v8 M10-8v8 M-5 10h10')],
 'Paint & refinishing':[piece('HVLP spray gun',135,160,'M-45-8h90v16h-90z M-15-8v-45h35v45 M10 8l-10 60h-20l5-60 M30 8v25h-20 M45-4h20v8h-20'),piece('Sanding block',315,160,'M-35 0h70v25h-70z M-25 0v-25q25-30 50 0v25 M-50 25h100v10h-100z'),piece('Primer surfacer',230,290,'M-30-30h60v60h-60z M-30-30q30-15 60 0 M-20-36v-12h40v12')]
};
