import { sql } from 'drizzle-orm';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const workTable = sqliteTable('work_table', {
  work_id_annict: integer('work_id_annict').primaryKey(),
  work_name: text('work_name', { length: 255 }).notNull(),
  work_id_anilist: integer('work_id_anilist'),
  official_site_url: text('official_site_url', { length: 2083 }),
  wikipedia_url: text('wikipedia_url', { length: 2083 }),
});

export const distributionSiteTable = sqliteTable('distribution_site_table', {
  distribution_site_id: integer('distribution_site_id').primaryKey(),
  distribution_site_name: text('distribution_site_name', {
    length: 255,
  }).notNull(),
});

export const workDistributionSiteMappingTable = sqliteTable(
  'work_distribution_site_mapping_table',
  {
    work_id_annict: integer('work_id_annict')
      .notNull()
      .references(() => workTable.work_id_annict),
    distribution_site_id: integer('distribution_site_id')
      .notNull()
      .references(() => distributionSiteTable.distribution_site_id),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.work_id_annict, table.distribution_site_id],
    }),
  }),
);

export const characterTable = sqliteTable('character_table', {
  character_id_annict: integer('character_id_annict').primaryKey(),
  character_name: text('character_name', { length: 255 }).notNull(),
  character_image_url: text('character_image_url', { length: 2083 }).notNull(),
  like_button_count: integer('like_button_count').default(0),
  registration_timestamp: text('registration_timestamp')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  work_id_annict: integer('work_id_annict')
    .notNull()
    .references(() => workTable.work_id_annict),
});

export const likeHistoryTable = sqliteTable(
  'like_history_table',
  {
    character_id_annict: integer('character_id_annict')
      .notNull()
      .references(() => characterTable.character_id_annict),
    cookie_id: text('cookie_id', { length: 255 }).notNull(),
    registration_timestamp: text('registration_timestamp')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.character_id_annict, table.cookie_id] }),
  }),
);

export const waitingListTable = sqliteTable(
  'waiting_list_table',
  {
    character_id_annict: integer('character_id_annict'),
    work_id_annict: integer('work_id_annict'),
    character_image_url: text('character_image_url', {
      length: 2083,
    }).notNull(),
    registration_timestamp: text('registration_timestamp')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    registered_flag: integer('registered_flag', { mode: 'boolean' })
      .notNull()
      .default(false),
    deleted_flag: integer('deleted_flag', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.character_id_annict, table.work_id_annict],
    }),
  }),
);
