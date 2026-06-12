import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is required"),
    department_id: z.string().uuid("Please select a department"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const createTicketSchema = z.object({
  priority: z.enum(["low", "medium", "high", "critical"]),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const guestTicketSchema = createTicketSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

export const updateCategorySchema = z.object({
  category: z.string().min(1, "Category is required"),
});

export const noteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty"),
});

export const statusSchema = z.object({
  status: z.enum([
    "pending",
    "assigned",
    "in_progress",
    "escalated",
    "closed",
  ]),
});

export const reassignSchema = z.object({
  agent_id: z.string().uuid("Please select an agent"),
});

export const createAgentSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  department_id: z.string().uuid("Please select a department"),
});

export const createAdminSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
});

export const updateCustomerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is required"),
    department_id: z.string().uuid("Please select a department"),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPassword = !!data.password?.trim();
    if (hasPassword && (data.password?.length ?? 0) < 4) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 4 characters",
        path: ["password"],
      });
    }
    if (hasPassword && data.password !== data.confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });

export const reportFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  department_id: z.string().optional(),
  agent_id: z.string().optional(),
  status: z
    .enum([
      "pending",
      "assigned",
      "in_progress",
      "escalated",
      "closed",
    ])
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type GuestTicketInput = z.infer<typeof guestTicketSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
