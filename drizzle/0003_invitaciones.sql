CREATE TABLE "invitaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid NOT NULL,
	"codigo_hash" text NOT NULL,
	"puede_crear_prestamos" boolean DEFAULT false NOT NULL,
	"vence_en" timestamp with time zone NOT NULL,
	"usada_en" timestamp with time zone,
	"usada_por" uuid,
	"revocada_en" timestamp with time zone,
	"revocada_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" uuid NOT NULL,
	CONSTRAINT "invitaciones_codigo_hash_unico" UNIQUE("codigo_hash"),
	CONSTRAINT "invitaciones_usada_check" CHECK (("invitaciones"."usada_en" is null) = ("invitaciones"."usada_por" is null)),
	CONSTRAINT "invitaciones_revocada_check" CHECK (("invitaciones"."revocada_en" is null) = ("invitaciones"."revocada_por" is null)),
	CONSTRAINT "invitaciones_usada_o_revocada_check" CHECK ("invitaciones"."usada_en" is null or "invitaciones"."revocada_en" is null),
	CONSTRAINT "invitaciones_codigo_hash_check" CHECK ("invitaciones"."codigo_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "invitaciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_usada_por_perfiles_id_fk" FOREIGN KEY ("usada_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_revocada_por_perfiles_id_fk" FOREIGN KEY ("revocada_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_creado_por_perfiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitaciones_negocio_idx" ON "invitaciones" USING btree ("negocio_id","creado_en");