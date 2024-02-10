"use server"

import { revalidatePath } from "next/cache"
import { faker } from "@faker-js/faker"
import { Label, Priority, Status, tasks } from "@prisma/client"
import type { z } from "zod"

// export async function seedTasks({
//   count = 100,
//   reset = false,
// }: {
//   count?: number
//   reset?: boolean
// }) {
//   const allTasks: Task[] = []

//   for (let i = 0; i < count; i++) {
//     allTasks.push({
//       id: createId(),
//       code: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
//       title: faker.hacker
//         .phrase()
//         .replace(/^./, (letter) => letter.toUpperCase()),
//       status:
//         faker.helpers.shuffle<Task["status"]>(tasks.status.enumValues)[0] ??
//         "todo",
//       label:
//         faker.helpers.shuffle<Task["label"]>(tasks.label.enumValues)[0] ??
//         "bug",
//       priority:
//         faker.helpers.shuffle<Task["priority"]>(tasks.priority.enumValues)[0] ??
//         "low",
//     })
//   }

//   reset && (await db.delete(tasks))

//   console.log("📝 Inserting tasks", allTasks.length)

//   await db.insert(tasks).values(allTasks)
// }

import prisma from "@/lib/prisma"
import { createId } from "@/lib/utils"

import type {
  updateTaskLabelSchema,
  updateTaskPrioritySchema,
  updateTaskStatusSchema,
} from "./validations"

export async function seedTasks({
  count = 100,
  reset = false,
}: {
  count?: number
  reset?: boolean
}) {
  const allTasks: tasks[] = []

  for (let i = 0; i < count; i++) {
    allTasks.push({
      id: createId(),
      code: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
      title: faker.hacker
        .phrase()
        .replace(/^./, (letter) => letter.toUpperCase()),
      status:
        faker.helpers.shuffle<tasks["status"]>(Object.values(Status))[0] ??
        "todo",
      label:
        faker.helpers.shuffle<tasks["label"]>(Object.values(Label))[0] ??
        "bug",
      priority:
        faker.helpers.shuffle<tasks["priority"]>(Object.values(Priority))[0] ??
        "low",
    })
  }

  if (reset) {
    await prisma.tasks.deleteMany()
  }

  console.log("📝 Inserting tasks", allTasks.length)

  for (const task of allTasks) {
    await prisma.tasks.create({ data: task })
  }
}

export async function updateTaskPriority({
  id,
  priority,
}: z.infer<typeof updateTaskPrioritySchema>) {
  console.log("updatePriorityAction", id, priority)

  await prisma.tasks.update({
    where: { id },
    data: { priority },
  })

  revalidatePath("/")
}

export async function updateTaskLabel({
  id,
  label,
}: z.infer<typeof updateTaskLabelSchema>) {
  console.log("updatePriorityAction", id, label)

  await prisma.tasks.update({
    where: { id },
    data: { label },
  })

  revalidatePath("/")
}

export async function updateTaskStatus({
  id,
  status,
}: { id: string, status: 'todo' | 'in_progress' | 'done' | 'canceled' }) {
  // console.log("updatePriorityAction", id, status)
  await prisma.tasks.update({
    where: { id },
    data: { status },
  })

  revalidatePath("/")
}


export async function deleteTask(input: { id: string }) {
  await prisma.tasks.delete({ where: { id: input.id } })

  // Create a new task for the deleted one
  // await seedTasks({ count: 1 })

  revalidatePath("/")
}
