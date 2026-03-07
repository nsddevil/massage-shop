import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("데이터 추출 중...");
  
  const employees = await prisma.employee.findMany();
  const courses = await prisma.course.findMany();

  const seedContent = `
import { PrismaClient, CourseType, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("시드 데이터 삽입 시작...");

  // 1. 직원(Employee) 데이터 삽입 (upsert)
  const rawEmployees = ${JSON.stringify(employees, null, 2)};
  const employees = rawEmployees.map(emp => ({
    ...emp,
    role: emp.role as Role,
    joinedAt: new Date(emp.joinedAt),
    resignedAt: emp.resignedAt ? new Date(emp.resignedAt) : null,
    createdAt: new Date(emp.createdAt),
    updatedAt: new Date(emp.updatedAt),
  }));

  for (const emp of employees) {
    const { id, ...data } = emp;
    await prisma.employee.upsert({
      where: { id },
      update: data as any,
      create: emp as any,
    });
  }
  console.log(\`\${employees.length}명의 직원 데이터가 처리되었습니다.\`);

  // 2. 코스(Course) 데이터 삽입 (upsert)
  const rawCourses = ${JSON.stringify(courses, null, 2)};
  const courses = rawCourses.map(course => ({
    ...course,
    type: course.type as CourseType,
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
  }));

  for (const course of courses) {
    const { id, ...data } = course;
    await prisma.course.upsert({
      where: { id },
      update: data as any,
      create: course as any,
    });
  }
  console.log(\`\${courses.length}개의 코스 데이터가 처리되었습니다.\`);

  console.log("시드 작업 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const outputPath = path.join(process.cwd(), "prisma", "seed.ts");
  fs.writeFileSync(outputPath, seedContent.trim());
  console.log(`성공! 시드 파일이 생성되었습니다: ${outputPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
