import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {generateId} from './utils';

const timestamp = {
    createdAt: integer('created_at', {mode: 'timestamp'})
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', {mode: 'timestamp'})
        .notNull()
        .$defaultFn(() => new Date())
};

const posts = sqliteTable('posts', {
    id: text('id')
        .primaryKey()
        .notNull()
        .$defaultFn(() => generateId(15)),
    title: text('title', {length: 255}).notNull(),
    slug: text('slug', {length: 255}).notNull(),
    body: text('body'),
    tags: text('tags').$type < string[] > (),

    ...timestamp
});

export {posts};
