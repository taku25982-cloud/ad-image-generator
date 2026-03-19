CREATE TABLE `stripe_webhook_event` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`processed_at` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
