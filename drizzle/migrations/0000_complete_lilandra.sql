CREATE TABLE `character_table` (
	`character_id_annict` integer PRIMARY KEY NOT NULL,
	`character_name` text(255) NOT NULL,
	`character_image_url` text(2083) NOT NULL,
	`like_button_count` integer DEFAULT 0,
	`registration_timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`work_id_annict` integer NOT NULL,
	FOREIGN KEY (`work_id_annict`) REFERENCES `work_table`(`work_id_annict`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `distribution_site_table` (
	`distribution_site_id` integer PRIMARY KEY NOT NULL,
	`distribution_site_name` text(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `like_history_table` (
	`character_id_annict` integer NOT NULL,
	`cookie_id` text(255) NOT NULL,
	`registration_timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`character_id_annict`, `cookie_id`),
	FOREIGN KEY (`character_id_annict`) REFERENCES `character_table`(`character_id_annict`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `waiting_list_table` (
	`character_id_annict` integer,
	`work_id_annict` integer,
	`character_image_url` text(2083) NOT NULL,
	`registration_timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`registered_flag` integer DEFAULT false NOT NULL,
	`deleted_flag` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`character_id_annict`, `work_id_annict`)
);
--> statement-breakpoint
CREATE TABLE `work_distribution_site_mapping_table` (
	`work_id_annict` integer NOT NULL,
	`distribution_site_id` integer NOT NULL,
	PRIMARY KEY(`work_id_annict`, `distribution_site_id`),
	FOREIGN KEY (`work_id_annict`) REFERENCES `work_table`(`work_id_annict`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`distribution_site_id`) REFERENCES `distribution_site_table`(`distribution_site_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_table` (
	`work_id_annict` integer PRIMARY KEY NOT NULL,
	`work_name` text(255) NOT NULL,
	`work_id_anilist` integer,
	`official_site_url` text(2083),
	`wikipedia_url` text(2083)
);
