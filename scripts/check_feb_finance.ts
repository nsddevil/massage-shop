import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const startDate = new Date(2026, 1, 1);
  const endDate = new Date(2026, 2, 0);

  console.log(
    `Checking data from ${startDate.toISOString()} to ${endDate.toISOString()}`,
  );

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    select: { id: true, totalPrice: true, createdAt: true },
  });

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  const settlements = await prisma.settlement.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
  });

  const extraPayments = await prisma.extraPayment.findMany({
    where: { date: { gte: startDate, lte: endDate }, isSettled: false },
  });

  console.log("\n--- Sales ---");
  console.log(`Count: ${sales.length}`);
  console.log(
    `Total Revenue: ${sales.reduce((sum, s) => sum + s.totalPrice, 0).toLocaleString()}`,
  );
  sales.forEach((s) =>
    console.log(
      `  ID: ${s.id}, Amount: ${s.totalPrice.toLocaleString()}, Date: ${s.createdAt}`,
    ),
  );

  console.log("\n--- Expenses (General) ---");
  console.log(`Count: ${expenses.length}`);
  console.log(
    `Total: ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
  );
  expenses.forEach((e) =>
    console.log(
      `  ID: ${e.id}, Amount: ${e.amount.toLocaleString()}, Category: ${e.category}`,
    ),
  );

  console.log("\n--- Settlements ---");
  console.log(`Count: ${settlements.length}`);
  console.log(
    `Total: ${settlements.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}`,
  );
  settlements.forEach((s) =>
    console.log(
      `  ID: ${s.id}, Type: ${s.type}, Amount: ${s.totalAmount.toLocaleString()}, Date: ${s.createdAt}`,
    ),
  );

  console.log("\n--- Extra Payments (Unsettled) ---");
  console.log(`Count: ${extraPayments.length}`);
  console.log(
    `Total: ${extraPayments.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
  );
  extraPayments.forEach((e) =>
    console.log(
      `  ID: ${e.id}, Amount: ${e.amount.toLocaleString()}, Type: ${e.type}`,
    ),
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
