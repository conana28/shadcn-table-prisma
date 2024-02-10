"use server"

import { SearchParams } from "@/types"

import { filterColumn } from "@/lib/filter-column"
import prisma from "@/lib/prisma"
import { searchParamsSchema } from "@/lib/validations/params"
import { Priority, Prisma, Status } from "@prisma/client";

type Task = {
  id: string
  code: string
  title: string
  status: "todo" | "in_progress" | "done" | "canceled"
  label: "bug" | "feature" | "enhancement" | "documentation"
  priority: "low" | "medium" | "high"
}

type tasksWhereInput = Prisma.tasksWhereInput;

export async function getTasks(searchParams: SearchParams) {
  try {
    const { page, per_page, sort, title, status, priority, operator } =
      searchParamsSchema.parse(searchParams)

    const pageAsNumber = Number(page)
    const fallbackPage =
      isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber
    const perPageAsNumber = Number(per_page)
    const limit = isNaN(perPageAsNumber) ? 10 : perPageAsNumber
    const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
    const [column, order] = (sort?.split(".") as [
      keyof Task | undefined,
      "asc" | "desc" | undefined,
    ]) ?? ["title", "desc"]

    const statuses = (status?.split(".") as Task["status"][]) ?? []
    const priorities = (priority?.split(".") as Task["priority"][]) ?? []

   
    function buildWhereClause({ title, statuses, priorities }: {
      title?: string;
      statuses?: string[];
      priorities?: string[];
    }): tasksWhereInput | undefined {
      const conditions: Array<tasksWhereInput> = [];

      if (title) {
        conditions.push({ title: { contains: title } });
      }

      if (statuses?.length ?? 0 > 0) {
        const statusArray: Status[] = statuses as Status[]; // Add type assertion here
        conditions.push({ status: { in: statusArray } });
      }

      if (priorities?.length ?? 0 > 0) {
        const prioritesArray: Priority[] = priorities as Priority[]; // Declare prioritesArray variable
        conditions.push({ priority: { in: prioritesArray } });
      }
    
      // Combine conditions with OR if any are present
      return conditions.length > 0 ? { OR: conditions } : undefined;
    }
    
    const whereClause = buildWhereClause({
      title: title,
      statuses: statuses,
      priorities: priorities,
    });
    const data = await prisma.tasks.findMany({
      where: whereClause,
      orderBy: {
        [column ?? "id"]: order ?? "desc",
      },
      skip: offset,
      take: limit,
    })

    const count = await prisma.tasks.count({
      where: whereClause,
    })

    const pageCount = Math.ceil(count / limit)
    return { data, pageCount }
  } catch (err) {
    console.log(err)
    return { data: [], pageCount: 0 }
  }
}

