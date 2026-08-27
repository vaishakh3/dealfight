ALTER TABLE `submissions` ADD `normalized_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `target_bid_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `amount_due_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_submissions_url_status_bid` ON `submissions` (`normalized_url`,`status`,`target_bid_cents`);