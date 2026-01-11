CREATE TABLE "nip98_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_value" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
