CREATE TABLE "feriados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"descripcion" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" uuid NOT NULL,
	CONSTRAINT "feriados_negocio_fecha_unico" UNIQUE("negocio_id","fecha"),
	CONSTRAINT "feriados_descripcion_check" CHECK (btrim("feriados"."descripcion") <> '')
);
--> statement-breakpoint
ALTER TABLE "feriados" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plantillas_prestamo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"negocio_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"condiciones" jsonb NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" uuid NOT NULL,
	CONSTRAINT "plantillas_nombre_check" CHECK (btrim("plantillas_prestamo"."nombre") <> ''),
	CONSTRAINT "plantillas_condiciones_check" CHECK ("plantillas_prestamo"."condiciones" is null or (jsonb_typeof("plantillas_prestamo"."condiciones") = 'object' and "plantillas_prestamo"."condiciones" ? 'version'))
);
--> statement-breakpoint
ALTER TABLE "plantillas_prestamo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "negocios" ADD COLUMN "tope_tasa_mensual" numeric(9, 4) DEFAULT '3' NOT NULL;--> statement-breakpoint
ALTER TABLE "negocios" ADD COLUMN "condiciones_defecto" jsonb;--> statement-breakpoint
ALTER TABLE "feriados" ADD CONSTRAINT "feriados_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feriados" ADD CONSTRAINT "feriados_creado_por_perfiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_prestamo" ADD CONSTRAINT "plantillas_prestamo_negocio_id_negocios_id_fk" FOREIGN KEY ("negocio_id") REFERENCES "public"."negocios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_prestamo" ADD CONSTRAINT "plantillas_prestamo_creado_por_perfiles_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "plantillas_negocio_nombre_activa_unico" ON "plantillas_prestamo" USING btree ("negocio_id",lower("nombre")) WHERE "plantillas_prestamo"."activa";--> statement-breakpoint
CREATE INDEX "plantillas_negocio_idx" ON "plantillas_prestamo" USING btree ("negocio_id","activa");--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_tope_tasa_mensual_check" CHECK ("negocios"."tope_tasa_mensual" > 0 and "negocios"."tope_tasa_mensual" <= 100);--> statement-breakpoint
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_condiciones_defecto_check" CHECK ("negocios"."condiciones_defecto" is null or (jsonb_typeof("negocios"."condiciones_defecto") = 'object' and "negocios"."condiciones_defecto" ? 'version'));