BEGIN TRANSACTION;
CREATE TABLE _migrations (name TEXT PRIMARY KEY);
INSERT INTO "_migrations" VALUES('0000_wakeful_phantom_reporter.sql');
INSERT INTO "_migrations" VALUES('0001_salty_roland_deschain.sql');
INSERT INTO "_migrations" VALUES('0002_omniscient_tag.sql');
CREATE TABLE `auth_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `diagrams` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
INSERT INTO "diagrams" VALUES('a8bf3ccd-1698-4c78-ad94-b728722ac3ab','demo','{"title":"RealOEM BMW Parts","vehicle":"","workorder":"","category":"exploded","url":"https://www.realoem.com/bmw/enUS/select","source":"https://www.realoem.com/bmw/","notes":""}','2026-10-27T02:29:25.142Z');
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `payment_settings` (
	`shop_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
CREATE TABLE `shops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`profile` text DEFAULT '{}' NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`paid_until` integer DEFAULT 0 NOT NULL,
	`subscription_id` text,
	`created` text NOT NULL
, `trial_until` integer DEFAULT 0 NOT NULL, `registration_email` text);
INSERT INTO "shops" VALUES('demo','OSP AutoCare · Demo','{"ownerName":"","address":"","phone":"","email":"","logo":""}',1,0,NULL,'2026-10-27T01:22:33.193Z',0,NULL);
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`password` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
INSERT INTO "users" VALUES('b342aff8-bb8a-4b99-90e8-eee3517fe813','demo','osp','OSP Administrator','owner','',0);
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE TABLE `workorders` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
CREATE INDEX `customers_shop_idx` ON `customers` (`shop_id`);
CREATE INDEX `diagrams_shop_idx` ON `diagrams` (`shop_id`);
CREATE INDEX `inventory_shop_idx` ON `inventory` (`shop_id`);
CREATE INDEX `purchases_shop_idx` ON `purchases` (`shop_id`);
CREATE INDEX `services_shop_idx` ON `services` (`shop_id`);
CREATE INDEX `suppliers_shop_idx` ON `suppliers` (`shop_id`);
CREATE INDEX `vehicles_shop_idx` ON `vehicles` (`shop_id`);
CREATE INDEX `workorders_shop_idx` ON `workorders` (`shop_id`);
CREATE UNIQUE INDEX `shops_registration_email_unique` ON `shops` (`registration_email`);
COMMIT;
