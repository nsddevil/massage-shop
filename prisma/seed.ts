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
  const rawEmployees = [
  {
    "id": "cmlwu3pey00004i8wmoszvfe9",
    "name": "Dy",
    "phone": "01022224444",
    "role": "THERAPIST",
    "joinedAt": "2024-02-18T15:00:00.000Z",
    "resignedAt": null,
    "payStartDay": 1,
    "baseSalary": 1800000,
    "hourlyRate": 0,
    "mealAllowance": 3000,
    "userId": null,
    "createdAt": "2026-02-21T21:31:58.186Z",
    "updatedAt": "2026-02-22T06:53:19.673Z"
  },
  {
    "id": "cmlwtsyt60000m0a0hd0zu1tn",
    "name": "NN",
    "phone": "010-2223-4040",
    "role": "THERAPIST",
    "joinedAt": "2025-09-04T15:00:00.000Z",
    "resignedAt": null,
    "payStartDay": 1,
    "baseSalary": 1600000,
    "hourlyRate": 0,
    "mealAllowance": 3000,
    "userId": null,
    "createdAt": "2026-02-21T21:23:37.145Z",
    "updatedAt": "2026-02-22T06:54:31.530Z"
  },
  {
    "id": "cmls2itk50001xwa0di6qp09c",
    "name": "김종환",
    "phone": "01063333250",
    "role": "OWNER",
    "joinedAt": "2024-02-18T15:00:00.000Z",
    "resignedAt": null,
    "payStartDay": 1,
    "baseSalary": 0,
    "hourlyRate": 10000,
    "mealAllowance": 15000,
    "userId": null,
    "createdAt": "2026-02-18T13:28:49.445Z",
    "updatedAt": "2026-02-22T06:55:11.755Z"
  },
  {
    "id": "cmlwtop6k0000eo8wha1g3paf",
    "name": "서희라",
    "phone": "01012345678",
    "role": "STAFF",
    "joinedAt": "2025-09-04T15:00:00.000Z",
    "resignedAt": null,
    "payStartDay": 1,
    "baseSalary": 0,
    "hourlyRate": 10000,
    "mealAllowance": 15000,
    "userId": null,
    "createdAt": "2026-02-21T21:20:18.043Z",
    "updatedAt": "2026-02-22T06:55:40.092Z"
  }
];
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
  console.log(`${employees.length}명의 직원 데이터가 처리되었습니다.`);

  // 2. 코스(Course) 데이터 삽입 (upsert)
  const rawCourses = [
  {
    "id": "cmlxeane70000fj8w2tlljqry",
    "name": "두리코스 -2",
    "type": "DOUBLE",
    "duration": 80,
    "price": 110000,
    "commissionSingle": 6000,
    "commissionDouble": 6000,
    "isActive": true,
    "createdAt": "2026-02-22T06:57:14.478Z",
    "updatedAt": "2026-03-07T09:37:36.816Z"
  },
  {
    "id": "cmlwu9pl200034i8w7wr6zlnl",
    "name": "스웨디시 A코스",
    "type": "SINGLE",
    "duration": 60,
    "price": 60000,
    "commissionSingle": 6000,
    "commissionDouble": 0,
    "isActive": true,
    "createdAt": "2026-02-21T21:36:38.342Z",
    "updatedAt": "2026-03-07T09:38:16.093Z"
  },
  {
    "id": "cmls1znsu0000xwa071aqb74n",
    "name": "스웨디시 A코스 -2 ",
    "type": "SINGLE",
    "duration": 90,
    "price": 80000,
    "commissionSingle": 8000,
    "commissionDouble": 0,
    "isActive": true,
    "createdAt": "2026-02-18T13:13:55.518Z",
    "updatedAt": "2026-03-07T09:38:25.473Z"
  },
  {
    "id": "cmls1vuwu0001vda014vu6c7g",
    "name": "두리코스 -1",
    "type": "DOUBLE",
    "duration": 60,
    "price": 90000,
    "commissionSingle": 6000,
    "commissionDouble": 6000,
    "isActive": true,
    "createdAt": "2026-02-18T13:10:58.110Z",
    "updatedAt": "2026-03-07T09:38:53.301Z"
  }
];
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
  console.log(`${courses.length}개의 코스 데이터가 처리되었습니다.`);

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