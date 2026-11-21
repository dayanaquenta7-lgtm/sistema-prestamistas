CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid NOT NULL,
	"nombre_completo" text NOT NULL,
	"ci" text,
	"telefono" text,
	"direccion" text,
	"referencia_nombre" text,
	"referencia_telefono" text,
	"notas" text,
	"tasa_preferencial" numeric(9, 4),
	"no_prestar" boolean DEFAULT false NOT NULL,
	"no_prestar_motivo" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" uuid NOT NULL,
	CONSTRAINT "clientes_nombre_check" CHECK (btrim("clientes"."nombre_completo") <> ''),
	CONSTRAINT "clientes_tasa_preferencial_check" CHECK ("clientes"."tasa_preferencial" is null or ("clientes"."tasa_preferencial" >= 0 and "clientes"."tasa_preferencial" <= 100)),
	CONSTRAINT "clientes_no_prestar_check" CHECK (("clientes"."no_prestar" and btrim(coalesce("clientes"."no_prestar_motivo", '')) <> '') or (not "clientes"."no_prestar" and "clientes"."no_prestar_motivo" is null))
);
--> statement-breakpoint
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_creado_por_perfiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clientes_negocio_ci_unico" ON "clientes" USING btree ("negocio_id","ci") WHERE "clientes"."ci" is not null;--> statement-breakpoint
CREATE INDEX "clientes_negocio_nombre_idx" ON "clientes" USING btree ("negocio_id","nombre_completo");