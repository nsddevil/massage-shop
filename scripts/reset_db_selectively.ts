import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- 데이터 초기화 시작 (직원/코스 제외) ---");

  try {
    await prisma.$transaction([
      // 1. 관계가 가장 복잡한 하위 테이블부터 삭제
      prisma.saleTherapist.deleteMany(),
      prisma.sale.deleteMany(),
      prisma.settlement.deleteMany(),
      prisma.extraPayment.deleteMany(),
      prisma.attendance.deleteMany(),
      prisma.expense.deleteMany(),
    ]);

    console.log("✅ 성공적으로 초기화되었습니다.");
    console.log("유지된 데이터: Employee, Course");
    console.log(
      "삭제된 데이터: Sale, SaleTherapist, Settlement, ExtraPayment, Attendance, Expense",
    );
  } catch (error) {
    console.error("❌ 초기화 중 오류 발생:", error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
