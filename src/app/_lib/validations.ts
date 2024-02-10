import * as z from "zod"

// export const updateTaskLabelSchema = z.object({
//   id: z.string(),
//   label: z.enum(Label.enumValues  as any  as string[]),
// })

export const updateTaskLabelSchema = z.object({
  id: z.string(),
  label: z.enum(['bug', 'feature', 'enhancement', 'documentation']),
});

export const updateTaskStatusSchema = z.object({
  id: z.string(),
  // status: z.enum(tasks.status.enumValues),
  status: z.enum(['todo', 'in_progress', 'done']),
})

export const updateTaskPrioritySchema = z.object({
  id: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
})
