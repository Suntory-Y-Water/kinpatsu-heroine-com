CREATE TABLE `character_table` (
	`character_id` integer PRIMARY KEY NOT NULL,
	`character_name` text(255) NOT NULL,
	`character_image_url` text(2083) NOT NULL,
	`like_count` integer DEFAULT 0,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`work_id` integer NOT NULL,
	FOREIGN KEY (`work_id`) REFERENCES `work_table`(`work_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `like_history_table` (
	`character_id` integer NOT NULL,
	`cookie_id` text(255) NOT NULL,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`character_id`, `cookie_id`),
	FOREIGN KEY (`character_id`) REFERENCES `character_table`(`character_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registration_queue_table` (
	`character_id` integer NOT NULL,
	`work_id` integer NOT NULL,
	`character_name` text(255) NOT NULL,
	`character_image_url` text(2083) NOT NULL,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`is_registered` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`character_id`, `work_id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_site_table` (
	`streaming_site_id` text(255) PRIMARY KEY NOT NULL,
	`streaming_site_name` text(255) NOT NULL,
	`icon_url` text(2083)
);
--> statement-breakpoint
CREATE TABLE `work_streaming_site_table` (
	`work_id` integer NOT NULL,
	`streaming_site_id` text(255) NOT NULL,
	`streaming_site_url` text(2083),
	PRIMARY KEY(`work_id`, `streaming_site_id`),
	FOREIGN KEY (`work_id`) REFERENCES `work_table`(`work_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`streaming_site_id`) REFERENCES `streaming_site_table`(`streaming_site_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_table` (
	`work_id` integer PRIMARY KEY NOT NULL,
	`work_name` text(255) NOT NULL,
	`official_site_url` text(2083),
	`wikipedia_url` text(2083)
);
