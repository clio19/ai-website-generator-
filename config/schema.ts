import { integer, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(2),
});

export const projectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar().notNull().unique(),
  createdBy: integer().references(() => usersTable.id),
  createdOn: timestamp().defaultNow()
});

export const frameTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar({ length: 255 }).unique(),
  projectId: integer().references(() => projectTable.id),
  designCode: text(),
  createdOn: timestamp().defaultNow()
});

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: text(),
  frameId: varchar().references(() => frameTable.frameId),
  createdBy: integer().references(() => usersTable.id),
  createdOn: timestamp().defaultNow()
});