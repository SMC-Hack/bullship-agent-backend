import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const authMessagesTable = pgTable('auth_messages', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  walletAddress: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).default('pending'),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  walletAddress: varchar({ length: 255 }).notNull().unique(),
  verified: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  agents: many(agentsTable),
}));

export const agentsTable = pgTable('agents', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  stockSymbol: varchar({ length: 255 }),
  stockAddress: varchar({ length: 255 }),
  imageUrl: varchar({ length: 255 }),
  selectedTokens: text().notNull(),
  strategy: text().notNull(),
  isRunning: boolean().notNull().default(false),
  nextFinalizeAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const agentsRelations = relations(agentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [agentsTable.userId],
    references: [usersTable.id],
  }),
  walletKey: one(walletKeysTable),
  log: many(logsTable),
  balanceSnapshots: one(balanceSnapshotsTable),
}));

export const logsTable = pgTable('logs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id),
  thought: text().notNull(),
  action: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  tokenAddr: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const logsRelations = relations(logsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [logsTable.agentId],
    references: [agentsTable.id],
  }),
}));

export const balanceSnapshotsTable = pgTable('balance_snapshots', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id)
    .unique(),
  balanceUSD: integer(),
  pnl: integer(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const balanceSnapshotsRelations = relations(
  balanceSnapshotsTable,
  ({ one }) => ({
    agent: one(agentsTable, {
      fields: [balanceSnapshotsTable.agentId],
      references: [agentsTable.id],
    }),
  }),
);

export const knowledgesTable = pgTable('knowledges', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const knowledgesRelations = relations(knowledgesTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [knowledgesTable.agentId],
    references: [agentsTable.id],
  }),
}));

export const walletKeysTable = pgTable('wallet_keys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .references(() => agentsTable.id)
    .notNull()
    .unique(),
  address: varchar({ length: 255 }).notNull().unique(),
  encryptedWalletData: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const walletKeysRelations = relations(walletKeysTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [walletKeysTable.agentId],
    references: [agentsTable.id],
  }),
}));
