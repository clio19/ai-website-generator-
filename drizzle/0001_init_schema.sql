DROP INDEX "projects_user_projectid_unique";--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "chatMessage" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "frameId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "frames" ALTER COLUMN "frameId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "projectKey" varchar(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_user_projectkey_unique" ON "projects" USING btree ("createdBy","projectKey");--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "projectId";