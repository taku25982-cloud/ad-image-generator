CREATE TABLE `brand_kit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo_url` text,
	`primary_color` text,
	`secondary_color` text,
	`accent_color` text,
	`preferred_tone` text,
	`default_copy_rules` text,
	`negative_rules` text,
	`font_preferences` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`brand_kit_id` text,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`tags` text,
	`archived_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_kit_id`) REFERENCES `brand_kit`(`id`) ON UPDATE no action ON DELETE no action
);

ALTER TABLE `generation` ADD `project_id` text REFERENCES `project`(`id`);
ALTER TABLE `generation` ADD `brand_kit_id` text REFERENCES `brand_kit`(`id`);
ALTER TABLE `generation` ADD `source_generation_id` text;
ALTER TABLE `generation` ADD `generation_group_id` text;
ALTER TABLE `generation` ADD `variant_label` text;
ALTER TABLE `generation` ADD `is_favorite` integer DEFAULT false NOT NULL;
ALTER TABLE `generation` ADD `origin_type` text;