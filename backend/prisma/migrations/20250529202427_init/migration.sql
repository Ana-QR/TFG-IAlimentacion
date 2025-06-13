-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "preferencias" TEXT,
    "fecha_registro" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "ListaCompra" (
    "id_lista" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3),

    CONSTRAINT "ListaCompra_pkey" PRIMARY KEY ("id_lista")
);

-- CreateTable
CREATE TABLE "DetalleListaCompra" (
    "id_detalle" SERIAL NOT NULL,
    "id_lista" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "DetalleListaCompra_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_producto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "valor_nutricional" TEXT,
    "categoria" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "IngredienteReceta" (
    "id_ingrediente" SERIAL NOT NULL,
    "id_receta" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "IngredienteReceta_pkey" PRIMARY KEY ("id_ingrediente")
);

-- CreateTable
CREATE TABLE "Receta" (
    "id_receta" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "instrucciones" TEXT,

    CONSTRAINT "Receta_pkey" PRIMARY KEY ("id_receta")
);

-- CreateTable
CREATE TABLE "Recomendacion" (
    "id_recomendacion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT,
    "fecha" TIMESTAMP(3),

    CONSTRAINT "Recomendacion_pkey" PRIMARY KEY ("id_recomendacion")
);

-- CreateTable
CREATE TABLE "Supermercado" (
    "id_supermercado" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Supermercado_pkey" PRIMARY KEY ("id_supermercado")
);

-- CreateTable
CREATE TABLE "PrecioProducto" (
    "id_precio" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_supermercado" INTEGER NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "PrecioProducto_pkey" PRIMARY KEY ("id_precio")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "ListaCompra" ADD CONSTRAINT "ListaCompra_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleListaCompra" ADD CONSTRAINT "DetalleListaCompra_id_lista_fkey" FOREIGN KEY ("id_lista") REFERENCES "ListaCompra"("id_lista") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleListaCompra" ADD CONSTRAINT "DetalleListaCompra_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredienteReceta" ADD CONSTRAINT "IngredienteReceta_id_receta_fkey" FOREIGN KEY ("id_receta") REFERENCES "Receta"("id_receta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredienteReceta" ADD CONSTRAINT "IngredienteReceta_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacion" ADD CONSTRAINT "Recomendacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioProducto" ADD CONSTRAINT "PrecioProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioProducto" ADD CONSTRAINT "PrecioProducto_id_supermercado_fkey" FOREIGN KEY ("id_supermercado") REFERENCES "Supermercado"("id_supermercado") ON DELETE RESTRICT ON UPDATE CASCADE;
