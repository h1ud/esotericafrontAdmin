CREATE TABLE IF NOT EXISTS "role" (
	"id" BIGINT,
	"role_name" VARCHAR(100) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "user" (
	"id" BIGINT,
	"id_role" BIGINT NOT NULL,
	"username" VARCHAR(100) NOT NULL UNIQUE,
	"password_hash" VARCHAR(255) NOT NULL,
	"name" VARCHAR(100) NOT NULL,
	"last_name" VARCHAR(100) NOT NULL,
	"create_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "client" (
	"id" BIGINT,
	"name" VARCHAR(100) NOT NULL,
	"password_hash" VARCHAR(255) NOT NULL,
	"dni" VARCHAR(15) NOT NULL UNIQUE,
	"birthday_date" DATE,
	"create_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "category" (
	"id" BIGINT,
	"category_name" VARCHAR(100) NOT NULL UNIQUE,
	"description" VARCHAR(255),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "product" (
	"id" BIGINT,
	"id_category" BIGINT NOT NULL,
	"product_name" VARCHAR(150) NOT NULL,
	"description" VARCHAR(255),
	"price" DECIMAL(10,2) NOT NULL CHECK("[object Object]" >= 0),
	"is_available" BOOLEAN NOT NULL DEFAULT true,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "promotion" (
	"id" BIGINT,
	"id_user" BIGINT NOT NULL,
	"title" VARCHAR(150) NOT NULL,
	"description" VARCHAR(500),
	"discount" DECIMAL(5,2) NOT NULL CHECK("[object Object]" > 0),
	"discount_type" VARCHAR(10) NOT NULL DEFAULT 'porcentaje' CHECK("[object Object]" IN porcentaje AND monto),
	"visibility" VARCHAR(10) NOT NULL DEFAULT 'publica' CHECK("[object Object]" IN publica AND privada),
	"is_active" BOOLEAN NOT NULL DEFAULT true,
	"start_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	"end_date" TIMESTAMP,
	"image_url" VARCHAR(500),
	"create_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "promo_code" (
	"id" BIGINT,
	"id_promotion" BIGINT NOT NULL,
	"id_client" BIGINT NOT NULL,
	"code" VARCHAR(20) NOT NULL UNIQUE,
	"is_active" BOOLEAN NOT NULL DEFAULT true,
	"is_used" BOOLEAN NOT NULL DEFAULT false,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"used_at" TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "sale_operation" (
	"id" BIGINT,
	"id_user" BIGINT NOT NULL,
	"id_promo_code" BIGINT,
	"payment_method" VARCHAR(20) NOT NULL CHECK("[object Object]" IN efectivo AND yape_plin),
	"payment_status" VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK("[object Object]" IN pendiente AND pagado AND anulado),
	"notes" VARCHAR(255),
	"subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"total" DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"issue_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "payment_evidence" (
	"id" BIGINT,
	"id_sale_operation" BIGINT NOT NULL UNIQUE,
	"image_url" VARCHAR(500) NOT NULL,
	"uploaded_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "sale_detail" (
	"id" BIGINT,
	"id_product" BIGINT NOT NULL,
	"id_sale_operation" BIGINT NOT NULL,
	"quantity" INTEGER NOT NULL CHECK("[object Object]" > 0),
	"unit_price" DECIMAL(10,2) NOT NULL CHECK("[object Object]" >= 0),
	"subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"notes" VARCHAR(255),
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "cash_closing" (
	"id" BIGINT,
	"id_user" BIGINT NOT NULL,
	"emission_date" TIMESTAMP NOT NULL DEFAULT NOW(),
	"total_efectivo" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"total_yape_plin" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"total" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK("[object Object]" >= 0),
	"id_last_sale_operation" BIGINT,
	"notes" VARCHAR(255),
	PRIMARY KEY("id")
);



ALTER TABLE "user"
ADD FOREIGN KEY("id_role") REFERENCES "role"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "product"
ADD FOREIGN KEY("id_category") REFERENCES "category"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "promotion"
ADD FOREIGN KEY("id_user") REFERENCES "user"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "promo_code"
ADD FOREIGN KEY("id_promotion") REFERENCES "promotion"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "promo_code"
ADD FOREIGN KEY("id_client") REFERENCES "client"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "sale_operation"
ADD FOREIGN KEY("id_user") REFERENCES "user"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "sale_operation"
ADD FOREIGN KEY("id_promo_code") REFERENCES "promo_code"("id")
ON UPDATE NO ACTION ON DELETE SET NULL;
ALTER TABLE "payment_evidence"
ADD FOREIGN KEY("id_sale_operation") REFERENCES "sale_operation"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "sale_detail"
ADD FOREIGN KEY("id_product") REFERENCES "product"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "sale_detail"
ADD FOREIGN KEY("id_sale_operation") REFERENCES "sale_operation"("id")
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE "cash_closing"
ADD FOREIGN KEY("id_user") REFERENCES "user"("id")
ON UPDATE NO ACTION ON DELETE RESTRICT;
ALTER TABLE "cash_closing"
ADD FOREIGN KEY("id_last_sale_operation") REFERENCES "sale_operation"("id")
ON UPDATE NO ACTION ON DELETE SET NULL;