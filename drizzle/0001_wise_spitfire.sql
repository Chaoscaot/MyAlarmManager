DO $$ BEGIN
 CREATE TYPE "public"."checkTypes" AS ENUM('G26', 'STRECKE', 'UNTERWEISUNG', 'UEBUNG');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alarm-agt_checks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" "checkTypes" NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"validity" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alarm-agt_checks" ADD CONSTRAINT "alarm-agt_checks_user_id_alarm-user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."alarm-user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
