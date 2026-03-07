import prisma from "../lib/prisma";

async function main() {
  try {
    const sale = await prisma.sale.findFirst();
    console.log("Prisma Client check success!");
    console.log("Sale:", sale);
    if (sale && 'startTime' in sale) {
        console.log("startTime exists in model at runtime");
    } else {
        console.log("startTime DOES NOT exist in model at runtime");
    }
  } catch (error) {
    console.error("Prisma Client check failed:", error);
  }
}

main();
