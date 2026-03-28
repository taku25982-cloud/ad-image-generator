CREATE TABLE `template_library_entry` (
	`user_id` text NOT NULL,
	`template_id` text NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`opens` integer DEFAULT 0 NOT NULL,
	`creates` integer DEFAULT 0 NOT NULL,
	`customizations` integer DEFAULT 0 NOT NULL,
	`last_opened_at` integer,
	`last_used_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`user_id`, `template_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `custom_template` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`base_template_id` text,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`template_data` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);