import { integer, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { uniqueIndex, index } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(2),
});

export const projectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar().notNull(),
  createdBy: integer().references(() => usersTable.id, { onDelete: 'set null' }),
  createdOn: timestamp().defaultNow()
}, (t) => ({
  userProjectIdUnique: uniqueIndex("projects_user_projectid_unique").on(t.createdBy, t.projectId),
}));

export const frameTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar({ length: 255 }).unique(), // <— torna-o único
  designCode: text(),
  projectId: integer().references(() => projectTable.id, { onDelete: 'cascade' }),
  createdOn: timestamp().defaultNow()
}, (t) => ({
  framesProjectIdx: index('frames_project_idx').on(t.projectId),
}));

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: text(),
  frameId: varchar().references(() => frameTable.frameId, { onDelete: 'cascade' }),
  projectId: integer().references(() => projectTable.id, { onDelete: 'cascade' }),
  createdOn: timestamp().defaultNow()
}, (t) => ({
  chatsFrameIdx: index('chats_frame_idx').on(t.frameId),
  chatsFrameProjectIdx: index('chats_frame_project_idx').on(t.frameId, t.projectId),
}));

