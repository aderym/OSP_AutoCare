import drawingAssets from '../public/part-drawings/assets.json' with {type:'json'};
import type {CatalogPart} from './parts-browser';
// Original type illustrations. Shared families identify a component's form, never OEM geometry.
const circle=(r:number)=>`M-${r} 0a${r} ${r} 0 1 0 ${r*2} 0a${r} ${r} 0 1 0-${r*2} 0`;
const ring=circle(43)+' '+circle(29);
const disc=ring+' '+circle(10)+' M-4-36h8 M-4 36h8 M-36-4v8 M36-4v8';
const box='M-45-30h90v60h-90z M-45-30l14-12h90v60l-14 12 M45-30l14-12';
const spring='M-16-53h32 M0-53v10l-28 10 56 10-56 10 56 10-56 10 56 10-56 10 28 10v10 M-16 47h32';
const bottle='M-32-35h32v-16h24v25l12 12v57h-68z M-20-8h43v37h-43z M3-46h18 M-32-26h25';
const panel='M-68 24l13-58h105l19 58z M-55-34l11 58 M50-34l-11 58 M-45-22h84';
export const componentShapes:Record<string,string>={
 piston:'M-28-40q28-15 56 0v40q-28 15-56 0z M-28-28q28 15 56 0 M-28-18q28 15 56 0 M-12 8v15h24v-15 M-7 23v20h14v-20 M-15 47a15 15 0 1 0 30 0a15 15 0 1 0-30 0',
 rod:'M-24-37a24 24 0 1 0 48 0a24 24 0 1 0-48 0 M-12-37a12 12 0 1 0 24 0a12 12 0 1 0-24 0 M-10-15l-6 49 M10-15l6 49 M-22 40a22 22 0 1 0 44 0a22 22 0 1 0-44 0 M-12 40a12 12 0 1 0 24 0a12 12 0 1 0-24 0',
 ring, bearing:disc+' M-31-12l7 4 M-12-31l4 7 M12-31l-4 7 M31-12l-7 4 M31 12l-7-4 M12 31l-4-7 M-12 31l4-7 M-31 12l7-4',
 engine:box+' M-34-30v-13h16v13 M2-30v-13h16v13 M-34-12h18v25h-18z M0-12h18v25h-18z M45-5h20v25h-20 M-35 30v15h15v-15 M20 30v15h15v-15',
 head:'M-65-20h130v40h-130z M-65-20l15-16h130l-15 16v40 M-45-8a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M-10-8a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M25-8a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
 crank:'M-80-8h20v-20h25v40h20v-40h25v40h20v-40h25v20h25v16h-25v20h-25v-40h-20v40h-25v-40h-20v40h-25v-20h-20z',
 camshaft:'M-80-8h160v16h-160z M-60-8q-12-37 10-25l10 25 M-15-8q-12-37 10-25l10 25 M30-8q-12-37 10-25l10 25 M-65 8v12h16v-12 M-20 8v12h16v-12 M25 8v12h16v-12',
 cover:panel+' M-22-24v43 M0-24v43 M22-24v43',
 pan:'M-65-20h130l-15 50h-100z M-65-20l12-13h106l12 13 M-50-9h100 M-30 3v18 M0 3v18 M30 3v18 M45 25h17v8h-17',
 gasket:'M-67-27h134v54h-134z M-55-16h110v32h-110z M-61-21h3 M58-21h3 M-61 21h3 M58 21h3',
 headgasket:'M-72-25h144v50h-144z M-58 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0 M-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0 M26 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0 M-66-19h5 M62-19h5 M-66 19h5 M62 19h5',
 seal:ring+' M-29-3h58 M-36-18l10 6 M26 12l10 6',
 belt:'M-70 0a25 25 0 0 1 25-25h90a25 25 0 0 1 0 50h-90a25 25 0 0 1-25-25z M-64 0a19 19 0 0 1 19-19h90a19 19 0 0 1 0 38h-90a19 19 0 0 1-19-19z M-40-25v6 M-25-25v6 M-10-25v6 M5-25v6 M20-25v6 M35-25v6 M-40 19v6 M-25 19v6 M-10 19v6 M5 19v6 M20 19v6 M35 19v6',
 chain:'M-70 0a25 25 0 0 1 25-25h90a25 25 0 0 1 0 50h-90a25 25 0 0 1-25-25z M-65 0a20 20 0 0 1 20-20h90a20 20 0 0 1 0 40h-90a20 20 0 0 1-20-20z M-45-25v5 M-30-25v5 M-15-25v5 M0-25v5 M15-25v5 M30-25v5 M45-25v5 M-45 20v5 M-30 20v5 M-15 20v5 M0 20v5 M15 20v5 M30 20v5 M45 20v5',
 pulley:disc+' M-22-22l14 14 M22-22l-14 14 M22 22l-14-14 M-22 22l14-14',
 gear:'M-40-12l12-7 1-16 15-6 11 12 14-2 8-14 16 6v16l10 9 16-1 7 15-12 10 1 15 13 9-7 15-16-2-11 8-2 15-15 5-9-12-15 1-9 13-14-7 2-15-10-10-16 1-5-15 12-10z '+circle(18),
 valve:'M-7-53h14v78l25 8v12q-32 12-64 0v-12l25-8z M-17 33h34 M-7-42h14',
 lifter:'M-17-40q17-10 34 0v80q-17 12-34 0z M-17-20q17 10 34 0 M-17 25q17 10 34 0 M-8-42h16',
 rocker:'M-60 2l25-25 55 8 40-18 9 16-45 30-55-10-20 13z M-14-5a12 12 0 1 0 24 0a12 12 0 1 0-24 0',
 manifold:'M-65-38h130v20h-12v52h-18v-52h-20v52h-18v-52h-20v52h-18v-52h-24z M-47 35h19 M-9 35h19 M29 35h19 M-50-28h100',
 turbo:'M-40 0a34 34 0 1 0 68 0a34 34 0 1 0-68 0 M-18 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0 M-40-12h-28v-20h35 M28-12h23v35h18v16h-35v-27 M-7-12v24 M-18 0h24',
 pump:'M-40-20h60l22 20-22 30h-60z M-20 0a18 18 0 1 0 36 0a18 18 0 1 0-36 0 M-40-10h-25v-25 M20 30v16h30 M-28-25v-10h35v15',
 thermostat:'M-50 17h100 M-25 17v-35q25-25 50 0v35 M-13 17v25h26v-25 M-33 0h66 M-20-8h40',
 hose:'M-75 22h30q20 0 20-22v-25q0-20 20-20h48v15h-48q-5 0-5 5v25q0 37-35 37h-30z M-67 17v25 M60-50v25',
 radiator:'M-65-35h130v70h-130z M-50-35v70 M-40-35v70 M-30-35v70 M-20-35v70 M-10-35v70 M0-35v70 M10-35v70 M20-35v70 M30-35v70 M40-35v70 M50-35v70 M-75-20h10 M65 20h12 M-50-42h12v7',
 reservoir:'M-44-23h55l27 25v40h-82z M-32-23v-20h28v20 M-18 1h38 M-18 12h38 M-44 30h82',
 cap:'M-35-15l12-12h46l12 12v30l-12 12h-46l-12-12z M-22-8h44v16h-44z M-45-8h10 M35-8h10',
 fan:'M-10-10q-45-60-55-15q0 25 55 35q-40 40-3 50q25 0 25-50q60 35 62-5q-5-25-52-16q30-60-12-59q-20 5-20 50z '+circle(11),
 spring, leaf:'M-78-20q78 65 156 0 M-65-10q65 53 130 0 M-48 1q48 37 96 0 M-8 10v35h16v-35 M-78-20a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M62-20a8 8 0 1 0 16 0a8 8 0 1 0-16 0',
 strut:spring+' M-7-30v-33h14v33 M-10 14v48h20v-48 M-20 53h40',
 mount:'M-45 32v-20l16-12v-25h58v25l16 12v20z M-29-25q29-20 58 0 M-15-12h30v25h-30z M-35 22h10 M25 22h10',
 bolt:'M-60-16h28v32h-28z M-32-7h96v14h-96 M-25-7l-6 14 M-12-7l-6 14 M1-7l-6 14 M14-7l-6 14 M27-7l-6 14 M40-7l-6 14 M53-7l-6 14',
 bracket:'M-45-40h20v60h65v20h-85z M-40-25h10 M-40-4h10 M-13 25v10 M23 25v10',
 guide:'M-55-30q55-20 110 0v18q-55-20-110 0z M-45-24v12 M45-24v12',
 dipstick:'M-25-45q0-20 25-20t25 20q0 20-25 20t-25-20 M-7-25v75h14v-75 M-7 30h14 M-7 38h14',
 injector:'M-11-52h22v22h12v36h-12v32h-22v-32h-12v-36h12z M-24-30l-16-18h-13v16h27 M-6 38v16h12v-16 M-22-20h44',
 rail:'M-80-12h160v24h-160z M-60 12v28h12v-28 M-25 12v28h12v-28 M10 12v28h12v-28 M45 12v28h12v-28 M-60-12v-15h15v15 M45-12v-15h15v15',
 tank:'M-65-25q0-15 15-15h100q15 0 15 15v50q0 15-15 15h-100q-15 0-15-15z M-45-40v80 M40-40v80 M-25-40v-15h25v15',
 throttle:'M-40-35h80v70h-80z '+circle(26)+' M-25-6l50 12 M40-12h25v30h-25 M-48-28h8 M-48 28h8',
 filter:'M-30-35q30-15 60 0v65q-30 18-60 0z M-30-35q30 15 60 0 M-20-20v42 M-10-17v42 M0-15v42 M10-17v42 M20-20v42',
 airfilter:'M-65-30h130v60h-130z M-55-25v50 M-45-25v50 M-35-25v50 M-25-25v50 M-15-25v50 M-5-25v50 M5-25v50 M15-25v50 M25-25v50 M35-25v50 M45-25v50 M55-25v50',
 sensor:'M-15-22h30v42h-30z M-25-12h50v25h-50z M-8 20v28h16v-28 M-10-22v-23h32v16h-10v7 M-5-38h13 M-5 30h10 M-5 38h10',
 solenoid:'M-35-20h55v40h-55z M-20-20v-20h28v20 M20-10h45v20h-45 M-35-8h-18v16h18 M-24-10h33',
 spark:'M-8-58h16v18h7v28h-30v-28h7z M-15-12h30v15h-30z M-9 3h18v37h-18z M-9 12h18 M-9 21h18 M-9 30h18 M0 40v12h12v-10',
 coil:'M-28-40h56v38h-56z M-14-2v47h28v-47 M-28-29h56 M-28-15h56 M28-30h22v18h-22 M-8 45v10h16v-10',
 motor:box+' '+circle(18)+' M-22-30v60 M-12-30v60 M45-5h25v10h-25 M-45 18h-17v15h17',
 alternator:'M-45-28h65l25 20v36h-90z M-45-28l14-14h65l11 34 M-30-28v56 M-20-28v56 M-10-28v56 M0-28v56 M10-28v56 M45-8h16v25h-16 M-28 28v13h15v-13',
 battery:box+' M-31-30v-12h17v12 M16-30v-12h17v12 M-30-8h17 M-22-16v16 M13-8h17',
 fuse:'M-20-28h40v45h-40z M-13 17v25h8v-25 M5 17v25h8v-25 M-13-9h8l10 14h8 M-13-20h26',
 relay:box+' M-30 30v20h8v-20 M-5 30v20h8v-20 M20 30v20h8v-20 M-30-15h45v23h-45z',
 module:box+' M-30-30v60 M-20-30v60 M-10-30v60 M0-30v60 M10-30v60 M20-30v60 M30-30v60 M-45-16h-15v32h15 M59-20h15v30h-15',
 connector:'M-42-25h84v50h-84z M-42-25l12-12h84v50l-12 12 M-28-12h10v10h-10z M-7-12h10v10h-10z M14-12h10v10h-10z M-28 8h10v10h-10z M-7 8h10v10h-10z M14 8h10v10h-10z',
 wire:'M-75-20q40-30 65 0t65 0 M-75-10q40-30 65 0t65 0 M-20-13v45h-24 M-16-11v48h-28 M-80-29h12v28h-12z M55-28h18v28h-18z M-56 27h13v17h-13z',
 switch:'M-35-20h70v40h-70z M-10-20v-32h20v32 M-25 20v15 M0 20v15 M25 20v15 M-24-5h48',
 horn:'M-50-12h28l42-25v74l-42-25h-28z M20-37q60 37 0 74 M-50-20h-12v40h12',
 distributor:'M-32-12q32-18 64 0v35q-32 15-64 0z M-32-12q32 15 64 0 M-25-12v-25h10v22 M-5-12v-30h10v30 M15-12v-25h10v25 M-8 30v25h16v-25',
 bulb:'M-25-15a25 25 0 1 1 50 0q0 16-13 28v22h-24v-22q-13-12-13-28 M-12 20h24 M-12 27h24 M-8 35v8h16v-8 M-7-12l7 20 7-20',
 exhaust:'M-80-17h25q20 0 20 20t20 20h95v14h-95q-35 0-35-34q0-6-6-6h-24z M-80-22v25 M80 18v25',
 muffler:'M-80-8h25v-22h100v22h25v16h-25v22h-100v-22h-25z M-40-30v60 M28-30v60 M-25-20h35',
 catalyst:'M-80-8h30l20-24h60l20 24h30v16h-30l-20 24h-60l-20-24h-30z M-20-24v48 M-8-27v54 M4-27v54 M16-24v48',
 clamp:'M-35 5a35 35 0 1 1 70 0 M-35 5v25h12v-25 M35 5v25h-12v-25 M-40 20h80 M-30 13v14 M30 13v14',
 shield:panel+' M-40-10h80 M-44 0h88 M-47 10h94',
 transmission:'M-65-35h58l42 15v18h30v32h-100l-30-25z M-45-35v65 M-30-35v65 M-15-35v65 M35 8h45v15h-45',
 clutch:disc+' M-23-23h46v46h-46z M-17-15h9v8h-9z M8-15h9v8h-9z M-17 7h9v8h-9z M8 7h9v8h-9z',
 axle:'M-80-6h30l8-16h26l8 16h50l8-16h18l8 16h4v12h-4l-8 16h-18l-8-16h-50l-8 16h-26l-8-16h-30z M-40-22v44 M-30-22v44 M-20-22v44 M53-22v44 M64-22v44',
 boot:'M-35-38h70l-8 12h16l-11 12h20l-15 12h23l-18 12v20h-60v-20l-18-12h23l-15-12h20l-11-12h16z',
 ujoint:'M-15-45h30v30h30v30h-30v30h-30v-30h-30v-30h30z M-22-45h44v12h-44z M-22 33h44v12h-44z M-45-22h12v44h-12z M33-22h12v44h-12z',
 driveshaft:'M-70-9h140v18h-140z M-65-20v40 M65-20v40 M-82-20h17 M65-20h17 M-82-20v40 M82-20v40',
 differential:'M-40-25l25-17h30l25 17v50l-25 17h-30l-25-17z M-40-9h-32v18h32 M40-9h32v18h-32 M-18-29h36v58h-36z M-28-32h6 M22-32h6 M-28 32h6 M22 32h6',
 arm:'M-65-18l114-12 17 18-115 40z M-58-7a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M40-10a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
 balljoint:'M-27 18v-36q27-25 54 0v36z M-42 18h84v12h-84z M-8-35v-24h16v24 M-14-35h28 M-10 30v16h20v-16',
 tie:'M-70-6h115v12h-115z M-70-6l-10-13h-8v38h8l10-13 M45-6h20v12h-20 M-42-10v20 M-32-10v20 M-22-10v20 M70-20v40',
 rack:'M-78-8h30v-13h96v13h30v16h-30v13h-96v-13h-30z M-40-21v42 M-30-21v42 M30-21v42 M40-21v42 M-12-21v-25h24v25',
 knuckle:'M-14-46h28l9 22 26 12v23l-26 6-9 28h-28l-9-28-26-6v-23l26-12z '+circle(16),
 subframe:'M-70-40h18v65h104v-65h18v80h-140z M-52-24h104v15h-104 M-52 12h104v13h-104 M-65-35h8 M57-35h8 M-65 30h8 M57 30h8',
 airbag:'M-35-40h70v80h-70z M-35-25q35 12 70 0 M-35-10q35 12 70 0 M-35 5q35 12 70 0 M-35 20q35 12 70 0 M-20-40v-10h40v10',
 rotor:disc, drum:circle(45)+' '+circle(17)+' M-45 0v22q45 32 90 0v-22 M-10-34h20 M-34-10v20 M34-10v20',
 pad:'M-55-30q55-30 110 0v50q-55-25-110 0z M-45-18q45-24 90 0v24q-45-18-90 0z M0-38v37 M-65-20h10 M55-20h10',
 shoe:'M-38-40q-65 40 0 80l8-12q-45-28 0-56z M38-40q65 40 0 80l-8-12q45-28 0-56z',
 caliper:'M-40-35h65l20 20v45h-25v-33h-30v33h-30z M-40-23h65 M-20-35v-12h20v12 M-24 15h6 M18 15h6',
 cylinder:'M-70-12h105v24h-105z M-45-12v-26h55v26 M35-6h35v12h-35 M-70-19v38 M-25-38v-8h22v8',
 booster:circle(47)+' '+circle(33)+' M-65-7h37v14h-37 M28-7h37v14h-37 M-15-43v10 M15 33v10',
 duct:'M-65-22h40l20-18h56v70h-56l-20-18h-40z M-55-12v14 M-45-12v14 M-35-12v14 M5-30v50 M20-30v50 M35-30v50',
 door:'M-60 45v-90h90l30 50v40z M-45-35v35h85l-20-35z M15 12h20 M-60 30h120',
 hood:panel,
 fender:'M-70 37v-55l35-25h90l15 25v55h-18q-25-80-72 0z M-55-15h95 M-70 12h25',
 bumper:'M-75-20q75 30 150 0v38q-75 35-150 0z M-55-4h27v14h-27z M28-4h27v14h-27z M-18 2h36v14h-36z',
 grille:'M-68-25h136l-12 50h-112z M-48-25v50 M-32-25v50 M-16-25v50 M0-25v50 M16-25v50 M32-25v50 M48-25v50 M-62-8h124 M-58 8h116',
 lamp:'M-65-18q55-30 110 0l20 20-20 25q-55 15-110-5z M-30 2a18 18 0 1 0 36 0a18 18 0 1 0-36 0 M20-9h25 M25 1h25 M25 11h20',
 glass:'M-70 32l18-64h104l18 64z M-55 20l13-40h84 M-30 12l16-23 M-18 18l24-35',
 mirror:'M-45-22q35-25 80 0v40q-40 20-80 0z M35 8l30 24v12h-18l-18-21 M-35-15q28-18 60 0v26q-28 14-60 0z',
 hinge:'M-45-30h35v60h-35z M10-30h35v60h-35z M-10-22h20v44h-20z M-29-17v8 M-29 9v8 M29-17v8 M29 9v8',
 latch:'M-35-35h70v70h-70z M-18-15h36v25h-36z M-10-15v-12h25 M-24 23h8 M18 23h8 M35 0h25v12h-25',
 handle:'M-60-15h120v30h-120z M-45-4h90v8h-90z M-45-15v-12h15v12 M30-15v-12h15v12',
 regulator:'M-58-35h116v12h-116z M-45-23l90 65 M45-23l-90 65 M-50 42h100v10h-100z '+circle(12)+' M-12 0h24',
 molding:'M-80-5h160v10h-160z M-80-5l12-10h160l-12 10 M80-5l12-10v10l-12 10',
 clip:'M-25-8h50v12h-50z M-8-8v-35h16v35 M-13 4l-12 28h50l-12-28 M-25 32l25 12 25-12',
 panel,
 seat:'M-28-55h50l10 79h-70z M-48 24h100v25h-100z M-28 49v16 M35 49v16 M-13-42h22v42h-22z',
 seatbelt:'M-66-35l113 30v27l-113-30z M35-15h32v48h-32z M-59-41v12 M-15-21v11 M47-4h9v24h-9z',
 safetyairbag:'M-48 0q0-48 48-48t48 48q0 48-48 48t-48-48z M-17-17h34v34h-34z',
 steering:circle(48)+' '+circle(36)+' '+circle(15)+' M-35-8l22 8 M35-8l-22 8 M-10 34l8-19 M10 34l-8-19',
 dashboard:'M-75 20v-25q75-48 150 0v25z M-50 0a18 18 0 1 0 36 0a18 18 0 1 0-36 0 M15-12h40v22h-40z M-75 20h150',
 console:'M-25-45h50l25 90h-100z M-18-30h36v20h-36z M-10 7a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M-17 28h34',
 speaker:disc+' M-25-25l50 50 M-25 25l50-50 M-33 0h66 M0-33v66',
 pedal:'M-12-55h24v45l22 12v40h-68v-40l22-12z M-22 8h44 M-22 20h44 M-22 32h44',
 pack:'M-70-35h140v70h-140z M-55-25h20v50h-20z M-25-25h20v50h-20z M5-25h20v50h-20z M35-25h20v50h-20z M-70-8h-14v16h14 M70-8h14v16h-14',
 charge:'M-35-35h70v70h-70z '+circle(26)+' M-12-12v8 M12-12v8 M-12 12v8 M12 12v8 M-4 0h8',
 bottle, can:'M-42-30q42-18 84 0v65q-42 18-84 0z M-42-30q42 18 84 0 M-42-22q42 18 84 0 M-25-8h50v30h-50z',
 tube:'M-20-45h40l-7 70v18h-26v-18z M-20-45h40v8h-40z M-8 43v9h16v-9 M-10-12h20',
 spray:'M-60-10h120v20h-120z M-25-10v-42h45v42 M6 10l-9 48h-22l8-48 M39 10v20h-25 M60-5h20v10h-20',
 tape:ring+' M29-29l40 20-12 24-28-12',
 sheet:'M-65-35h115l15 70h-115z M-45-24l75 49 M-30-24l75 49 M-15-24l62 40 M0-24l45 29 M-50-15l60 40 M-50 0l38 25',
 film:'M-60-20h120v50h-120z M-60-20q15-25 30 0v50q-15 20-30 0 M-45-32v64 M-30-20h90',
 padmaterial:circle(45)+' '+circle(34)+' M-25-25l50 50 M-25 25l50-50 M-36-8h72 M-36 8h72',
 cup:'M-38-45h76l-12 85h-52z M-38-45q38 16 76 0 M-23-20h22 M-23-5h16 M-23 10h22 M-23 25h16',
 stick:'M-65-10h125q20 10 0 20h-125q-20-10 0-20z',
 strainer:'M-50-25h100l-45 60h-10z M-50-25q50-20 100 0 M-35-10h70 M-22 8h44',
 scale:'M-60 5h120v35h-120z M-45-32h90v37h-90z M-40 15h35v15h-35z M17 21h10 M37 21h10',
 gauge:'M-25-48h50v90h-50z M-15-35h30v28h-30z M-10 10h20 M-10 22h20 M-8 42v12h16v-12',
 tool:'M-60-30l22 15 15-15-15-22q38-3 35 34l52 52-12 12-52-52q-35 1-32-24z',
 process:panel+' M40-48l25 8 M45-35l30 4 M45-23h30 M-24-10h45 M-24 1h45 M-24 12h45',
};
// Match special forms before broad nouns (e.g. a pump gasket is a gasket, not a pump).
const rules:[RegExp,string][]=[
 [/fuel pump module/,'pump'],[/airbag module/,'safetyairbag'],[/hardware kit|slide pin kit/,'bolt'],[/charge port actuator/,'solenoid'],
 [/windshield adhesive|body filler|fiberglass filler|aluminum body filler|glazing putty|seam sealer/,'tube'],
 [/washer$/,'ring'],[/^tire$/,'tire'],[/^wheel$/,'wheel'],[/tire valve stem/,'sensor'],[/fan clutch/,'clutch'],[/fan shroud/,'ring'],[/fan|blower wheel/,'fan'],[/chain guide/,'guide'],[/tensioner/,'pulley'],[/wire set/,'wire'],[/compressor/,'pump'],[/voltage regulator/,'module'],[/coolant flange/,'rotor'],[/door check strap/,'latch'],[/mirror turn signal/,'lamp'],[/hvac control panel/,'dashboard'],[/brake shoe|parking brake shoe/,'shoe'],
 [/head gasket/,'headgasket'],[/gasket/,'gasket'],[/seal|o-ring|weatherstrip/,'seal'],[/bearing|bushing/,'bearing'],[/piston ring/,'ring'],[/bolt|stud|nut|screw|fastener/,'bolt'],[/clip|retainer/,'clip'],[/bracket|mounting|hold down/,'bracket'],
 [/sensor|sending unit/,'sensor'],[/solenoid|contactor/,'solenoid'],[/\bmodule\b|control module|management module|control unit|hydraulic unit|fuse box|inverter|dc-dc converter|onboard charger/,'module'],[/switch|disconnect|lock cylinder/,'switch'],[/cable|wiring|ground strap|ground wire/,'wire'],[/connector|terminal/,'connector'],[/relay/,'relay'],[/fuse/,'fuse'],
 [/spray gun nozzle|orifice|nozzle/,'injector'],[/hvlp spray gun/,'spray'],[/charge port door/,'panel'],[/charge port/,'charge'],[/high voltage battery/,'pack'],[/battery tray/,'bracket'],[/^battery$/,'battery'],[/battery cooling plate/,'radiator'],
 [/shock|strut$|strut assembly/,'strut'],[/strut mount|engine mount|transmission mount/,'mount'],[/dust boot|cv boot|rack boot|coil boot|bump stop/,'boot'],[/leaf spring u-bolt/,'bolt'],[/leaf spring shackle/,'bracket'],[/leaf spring/,'leaf'],[/coil spring|valve spring/,'spring'],[/spring seat/,'ring'],[/air suspension bag/,'airbag'],[/subframe|crossmember|frame rail/,'subframe'],[/knuckle/,'knuckle'],[/ball joint/,'balljoint'],[/tie rod|sway bar link|toe link|lateral link/,'tie'],[/control arm|trailing arm|clutch fork|rocker arm/,'arm'],[/steering rack/,'rack'],[/steering wheel/,'steering'],[/steering column|intermediate shaft|balance shaft/,'driveshaft'],
 [/brake pad|brake shoe|parking brake shoe/,'pad'],[/rotor|flywheel|flexplate|brake backing plate|brake dust shield/,'rotor'],[/brake drum/,'drum'],[/brake caliper/,'caliper'],[/brake booster/,'booster'],[/master cylinder|slave cylinder|wheel cylinder/,'cylinder'],[/pedal/,'pedal'],[/cv axle|cv joint|axle shaft/,'axle'],[/u-joint/,'ujoint'],[/drive shaft|slip yoke/,'driveshaft'],[/differential/,'differential'],[/torque converter|clutch kit|compressor clutch|release bearing/,'clutch'],[/automatic transmission|manual transmission|cvt transmission|transfer case|reduction gear|steering gear box/,'transmission'],[/valve body|valve block/,'module'],[/hub assembly/,'rotor'],
 [/radiator support|radiator core support/,'subframe'],[/radiator|condenser|evaporator|heater core|intercooler|cooler|ptc cabin heater/,'radiator'],[/fan shroud/,'ring'],[/fan|blower wheel/,'fan'],[/reservoir|expansion tank/,'reservoir'],[/cap$|cap set/,'cap'],[/thermostat/,'thermostat'],[/hose|pipe|line$|line kit|filler neck|pickup tube|dipstick tube/,'hose'],[/clamp|hanger/,'clamp'],[/muffler|resonator/,'muffler'],[/catalyst|catalytic|particulate filter/,'catalyst'],[/heat shield|underbody shield|splash shield/,'shield'],[/egr|pcv|purge valve|vent valve|service valve|control valve|expansion valve|heat pump valve|drain valve|valve stem|tire valve/,'valve'],[/pump|a\/c compressor|supercharger/,'pump'],
 [/fuel rail/,'rail'],[/injector/,'injector'],[/fuel tank strap/,'bracket'],[/fuel tank|def tank/,'tank'],[/throttle body/,'throttle'],[/canister|accumulator|receiver drier|water separator/,'filter'],[/air filter|air intake resonator/,'airfilter'],[/filter/,'filter'],[/fuel pressure regulator|wastegate|actuator|blend door/,'solenoid'],
 [/spark plug$|glow plug$/,'spark'],[/ignition coil$/,'coil'],[/distributor/,'distributor'],[/alternator$/,'alternator'],[/motor|starter/,'motor'],[/horn$/,'horn'],[/bulb/,'bulb'],[/belt|tensioner/,'belt'],[/chain/,'chain'],[/pulley|balancer|camshaft adjuster/,'pulley'],[/timing.*guide/,'guide'],[/piston$/,'piston'],[/connecting rod/,'rod'],[/crankshaft$/,'crank'],[/camshaft$/,'camshaft'],[/engine assembly|engine block/,'engine'],[/cylinder head$/,'head'],[/cover/,'cover'],[/oil pan$/,'pan'],[/manifold/,'manifold'],[/turbocharger/,'turbo'],[/lifter/,'lifter'],[/valve$|valve guide/,'valve'],[/oil drain plug|drain plug/,'bolt'],[/dipstick$/,'dipstick'],
 [/hood hinge|door hinge|tailgate hinge/,'hinge'],[/hinge/,'hinge'],[/latch|\block\b/,'latch'],[/handle/,'handle'],[/window regulator|wiper linkage/,'regulator'],[/headlight|taillight|fog light|signal lamp|license plate light|dome lamp|rear reflector/,'lamp'],[/mirror glass|side mirror/,'mirror'],[/windshield|door glass|rear glass|sunroof/,'glass'],[/fender/,'fender'],[/door shell|door skin/,'door'],[/bumper|grille insert/,'bumper'],[/grille/,'grille'],[/hood$|hood insulation/,'hood'],[/molding|trim|roof rail|bed rail cap|intrusion beam/,'molding'],[/panel|pillar|tailgate|liftgate|trunk|pickup bed|cowl|apron|spare tire well|cab corner/,'panel'],[/headliner|carpet|sun visor/,'sheet'],[/hvac air duct/,'duct'],
 [/seat belt/,'seatbelt'],[/seat track/,'rail'],[/seat assembly/,'seat'],[/airbag clock spring/,'ring'],[/airbag/,'safetyairbag'],[/dashboard|instrument cluster|hvac control/,'dashboard'],[/console|glove box/,'console'],[/speaker/,'speaker'],[/grab handle/,'handle'],[/camera|spectrophotometer/,'gauge'],[/tire repair patch|wheel weight/,'padmaterial'],[/^tire$|^wheel$/,'rotor'],[/wiper blade|wiper arm/,'molding'],[/hardware kit|repair kit|slide pin kit/,'bolt'],[/air regulator/,'gauge'],
 [/masking tape|fine line.*tape|foam.*tape|aperture.*tape/,'tape'],[/masking film|protection film|masking paper/,'film'],[/sandpaper|scuff pad|cloth|wiping/,'sheet'],[/buffing pad|polishing pad|sanding disc|interface foam/,'padmaterial'],[/mixing cup|cup liner/,'cup'],[/mixing stick|cavity wax wand/,'stick'],[/strainer/,'strainer'],[/mixing scale/,'scale'],[/thickness gauge/,'gauge'],[/matching lamp/,'lamp'],[/spray-out card/,'sheet'],[/sanding block/,'box'],[/filler|putty|seam sealer|adhesive/,'tube'],[/surface preparation|dent repair|panel replacement|bumper repair|rust removal|masking and protection|application|block sanding|color matching|color blend|texture matching|polishing$|finish inspection/,'process'],[/paint|coat|primer|sealer|hardener|reducer|remover|promoter|wax|toner|additive|solvent|cleaner|compound|polish|converter|inhibitor/,'can'],[/fluid|engine oil$|gear oil$|coolant$/,'bottle'],
];
componentShapes.box=box;
componentShapes.wheel=disc+' M-25-25l17 17 M25-25l-17 17 M25 25l-17-17 M-25 25l17-17';
componentShapes.tire=circle(53)+' '+circle(34)+' M-42-34l9 5 M-18-49l4 10 M18-49l-4 10 M42-34l-9 5 M49-10l-10 2 M49 10l-10-2 M42 34l-9-5 M18 49l-4-10 M-18 49l4-10 M-42 34l9-5 M-49 10l10-2 M-49-10l10 2';
export function componentDrawingFamily(part:CatalogPart):string {
 const n=part.name.toLowerCase();
 if(/pulley$/.test(n))return 'pulley';
 if(/drain plug/.test(n))return 'bolt';
 if(/drain gasket/.test(n))return 'ring';
 if(/weatherstrip/.test(n))return 'gasket';
 if(/seat belt/.test(n))return 'seatbelt';
 if(/pump$/.test(n))return 'pump';
 if(/motor resistor/.test(n))return 'module';
 if(/charging cable lock/.test(n))return 'solenoid';
 if(/air intake resonator/.test(n))return 'airfilter';
 if(part.category==='Paint & refinishing'&&/preparation|dent repair|panel replacement|bumper repair|rust removal|masking and protection|application|block sanding|color matching and|color blend|texture matching|de-nibbing|finish inspection/.test(n))return 'process';

 if(part.category==='Body & collision'){
  if(/molding|roof rail|bed rail cap/.test(n))return 'molding';
  if(/bracket/.test(n))return 'bracket';
  if(/retainer|clip/.test(n))return 'clip';
  if(/fastener/.test(n))return 'bolt';
  if(/grille/.test(n))return 'grille';
  if(/bumper/.test(n))return 'bumper';
  if(/mirror cover/.test(n))return 'mirror';
 }
 if(/compressor clutch/.test(n))return 'clutch';
 if(/compressor control valve|fuel rail pressure regulator/.test(n))return 'solenoid';
 if(/hose connector/.test(n))return 'hose';
 if(/hose|cooler line|feed line|return line/.test(n)&&!/sensor|gasket|seal|clamp/.test(n))return 'hose';
 if(/flange$/.test(n))return 'rotor';

 // Fluids are products, not installed cooling assemblies.
 if(part.category==='Maintenance & fluids'&&/fluid|^engine oil$|^gear oil$|^engine coolant$/.test(n))return 'bottle';
 const match=rules.find(([pattern])=>pattern.test(n));
 return match?.[1]||'';
}
const assets:Record<string,{vector:string;image:string;thumbnail:string}>=drawingAssets;
export function componentDrawingPath(part:Pick<CatalogPart,'id'>){return assets[part.id]?.vector||'/part-drawings/'+encodeURIComponent(part.id)+'.svg';}
export function componentImagePath(part:Pick<CatalogPart,'id'>,thumbnail=false){return (thumbnail?assets[part.id]?.thumbnail:assets[part.id]?.image)||componentDrawingPath(part);}
