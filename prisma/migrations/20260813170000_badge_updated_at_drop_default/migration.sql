-- O DEFAULT foi usado apenas para preencher as linhas existentes ao adicionar a
-- coluna. O Prisma controla `updatedAt` via @updatedAt, então o banco não deve
-- declarar default próprio — senão o schema diverge das migrations.
ALTER TABLE "Badge" ALTER COLUMN "updatedAt" DROP DEFAULT;
