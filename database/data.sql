BEGIN TRANSACTION;
INSERT INTO "_migrations" VALUES('0000_wakeful_phantom_reporter.sql');
INSERT INTO "_migrations" VALUES('0001_salty_roland_deschain.sql');
INSERT INTO "_migrations" VALUES('0002_omniscient_tag.sql');
INSERT INTO "diagrams" VALUES('a8bf3ccd-1698-4c78-ad94-b728722ac3ab','demo','{"title":"RealOEM BMW Parts","vehicle":"","workorder":"","category":"exploded","url":"https://www.realoem.com/bmw/enUS/select","source":"https://www.realoem.com/bmw/","notes":""}','2026-10-27T02:29:25.142Z');
INSERT INTO "shops" VALUES('demo','OSP AutoCare · Demo','{"ownerName":"","address":"","phone":"","email":"","logo":""}',1,0,NULL,'2026-10-27T01:22:33.193Z',0,NULL);
INSERT INTO "users" VALUES('b342aff8-bb8a-4b99-90e8-eee3517fe813','demo','osp','OSP Administrator','owner','',0);
COMMIT;
