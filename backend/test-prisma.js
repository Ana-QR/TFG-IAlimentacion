const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const detalles = await prisma.detalleListaCompra.findMany();
  console.log(detalles);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
