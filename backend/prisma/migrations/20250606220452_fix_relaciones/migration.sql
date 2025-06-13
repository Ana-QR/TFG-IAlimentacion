/*
  Warnings:

  - You are about to drop the column `cantidad` on the `IngredienteReceta` table. All the data in the column will be lost.
  - You are about to alter the column `precio` on the `PrecioProducto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `categoria` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `valor_nutricional` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `instrucciones` on the `Receta` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `Receta` table. All the data in the column will be lost.
  - You are about to drop the column `contenido` on the `Recomendacion` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Recomendacion` table. All the data in the column will be lost.
  - You are about to drop the column `preferencias` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Supermercado` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fecha_creacion` on table `ListaCompra` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nombre` to the `Receta` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `Receta` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `mensaje` to the `Recomendacion` table without a default value. This is not possible if the table is not empty.
  - Made the column `fecha_registro` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "IngredienteReceta" DROP COLUMN "cantidad";

-- AlterTable
ALTER TABLE "ListaCompra" ALTER COLUMN "fecha_creacion" SET NOT NULL,
ALTER COLUMN "fecha_creacion" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PrecioProducto" ALTER COLUMN "precio" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "categoria",
DROP COLUMN "descripcion",
DROP COLUMN "valor_nutricional";

-- AlterTable
ALTER TABLE "Receta" DROP COLUMN "instrucciones",
DROP COLUMN "titulo",
ADD COLUMN     "nombre" TEXT NOT NULL,
ALTER COLUMN "descripcion" SET NOT NULL;

-- AlterTable
ALTER TABLE "Recomendacion" DROP COLUMN "contenido",
DROP COLUMN "tipo",
ADD COLUMN     "mensaje" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "preferencias",
ALTER COLUMN "fecha_registro" SET NOT NULL,
ALTER COLUMN "fecha_registro" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "_HistorialProductos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HistorialProductos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HistorialProductos_B_index" ON "_HistorialProductos"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Supermercado_nombre_key" ON "Supermercado"("nombre");

-- AddForeignKey
ALTER TABLE "_HistorialProductos" ADD CONSTRAINT "_HistorialProductos_A_fkey" FOREIGN KEY ("A") REFERENCES "Producto"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HistorialProductos" ADD CONSTRAINT "_HistorialProductos_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
