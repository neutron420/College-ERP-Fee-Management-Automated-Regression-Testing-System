// Load the generated client at runtime so TypeScript does not require its
// generated declarations while this package is being built.
type PrismaClient = any;
declare const require: (moduleName: string) => {
  PrismaClient: new () => PrismaClient;
};
const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new () => PrismaClient;
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

const nodeEnv = (globalThis as typeof globalThis & {
  process?: { env?: { NODE_ENV?: string } };
}).process?.env?.NODE_ENV;

if (nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

