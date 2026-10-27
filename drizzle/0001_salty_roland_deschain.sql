CREATE INDEX `customers_shop_idx` ON `customers` (`shop_id`);--> statement-breakpoint
CREATE INDEX `diagrams_shop_idx` ON `diagrams` (`shop_id`);--> statement-breakpoint
CREATE INDEX `inventory_shop_idx` ON `inventory` (`shop_id`);--> statement-breakpoint
CREATE INDEX `purchases_shop_idx` ON `purchases` (`shop_id`);--> statement-breakpoint
CREATE INDEX `services_shop_idx` ON `services` (`shop_id`);--> statement-breakpoint
CREATE INDEX `suppliers_shop_idx` ON `suppliers` (`shop_id`);--> statement-breakpoint
CREATE INDEX `vehicles_shop_idx` ON `vehicles` (`shop_id`);--> statement-breakpoint
CREATE INDEX `workorders_shop_idx` ON `workorders` (`shop_id`);