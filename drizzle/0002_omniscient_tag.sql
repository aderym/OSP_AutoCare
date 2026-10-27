ALTER TABLE `shops` ADD `trial_until` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shops` ADD `registration_email` text;--> statement-breakpoint
CREATE UNIQUE INDEX `shops_registration_email_unique` ON `shops` (`registration_email`);