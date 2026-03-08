import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phoneNumber"),
  email: text("email"),
  linkedId: integer("linkedId"), // null for primary contacts
  linkPrecedence: text("linkPrecedence").notNull().default("primary"), // "primary" or "secondary"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export const insertContactSchema = createInsertSchema(contacts);

export const identifyRequestSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
}).refine(data => {
  const hasEmail = data.email !== undefined && data.email !== "";
  const hasPhone = data.phoneNumber !== undefined && data.phoneNumber !== "";
  return hasEmail || hasPhone;
}, {
  message: "Either email or phoneNumber must be provided",
});

export type IdentifyRequest = z.infer<typeof identifyRequestSchema>;

export const identifyResponseSchema = z.object({
  contact: z.object({
    primaryContactId: z.number(),
    emails: z.array(z.string()),
    phoneNumbers: z.array(z.string()),
    secondaryContactIds: z.array(z.number())
  })
});

export type IdentifyResponse = z.infer<typeof identifyResponseSchema>;
