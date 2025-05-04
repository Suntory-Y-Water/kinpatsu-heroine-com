CREATE TABLE `login_attempts_table` (
	`ip_address` text(45) NOT NULL,
	`username` text(255) NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`last_failure_timestamp` text NOT NULL,
	`lockout_until` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`ip_address`, `username`)
);
