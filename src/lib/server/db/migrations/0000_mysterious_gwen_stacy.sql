CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`username_github` text(65535) NOT NULL,
	`text` text(65535) NOT NULL,
	`done` integer,
	`deleted` integer,
	`synced` integer,
	`user_agent` text(65535),
	`created_at` integer,
	`deleted_at` integer,
	`updated_at` integer,
	`done_at` integer,
	`syncedAt` integer
);
