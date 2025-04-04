ALTER TABLE "agents" ALTER COLUMN "stockSymbol" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "stockAddress" varchar(255);