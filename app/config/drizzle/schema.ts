import { sql } from 'drizzle-orm';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const workTable = sqliteTable('work_table', {
  work_id: integer('work_id').primaryKey(),
  official_site_url: text('official_site_url', { length: 2083 }),
  wikipedia_url: text('wikipedia_url', { length: 2083 }),
});

export const streamingSiteTable = sqliteTable('streaming_site_table', {
  streaming_site_id: text('streaming_site_id', { length: 255 }).primaryKey(),
  streaming_site_name: text('streaming_site_name', { length: 255 }).notNull(),
});

export const workStreamingSiteTable = sqliteTable(
  'work_streaming_site_table',
  {
    work_id: integer('work_id')
      .notNull()
      .references(() => workTable.work_id),
    streaming_site_id: text('streaming_site_id', { length: 255 })
      .notNull()
      .references(() => streamingSiteTable.streaming_site_id),
    streaming_site_url: text('streaming_site_url', { length: 2083 }),
  },
  (table) => [
    primaryKey({ columns: [table.work_id, table.streaming_site_id] }),
  ],
);

export const characterTable = sqliteTable('character_table', {
  character_id: integer('character_id').primaryKey(),
  registration_date: text('registration_date')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  work_id: integer('work_id')
    .notNull()
    .references(() => workTable.work_id),
});

export const likeHistoryTable = sqliteTable(
  'like_history_table',
  {
    character_id: integer('character_id')
      .notNull()
      .references(() => characterTable.character_id),
    cookie_id: text('cookie_id', { length: 255 }).notNull(),
    registration_date: text('registration_date')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.character_id, table.cookie_id] })],
);

export const registrationQueueTable = sqliteTable(
  'registration_queue_table',
  {
    character_id: integer('character_id').notNull(),
    work_id: integer('work_id').notNull(),
    character_name: text('character_name', { length: 255 }).notNull(),
    work_name: text('work_name', { length: 255 }).notNull().default(''),
    character_image_url: text('character_image_url', {
      length: 2083,
    }).notNull(),
    registration_date: text('registration_date')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    is_registered: integer('is_registered', { mode: 'boolean' })
      .notNull()
      .default(false),
    is_deleted: integer('is_deleted', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (table) => [
    primaryKey({
      columns: [table.character_id, table.work_id],
    }),
  ],
);
