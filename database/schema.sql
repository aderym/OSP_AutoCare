CREATE TABLE _migrations (name TEXT PRIMARY KEY);
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
