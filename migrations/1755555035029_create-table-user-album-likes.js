/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'albums',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        created_at: {
            type: 'TIMESTAMP',
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'TIMESTAMP',
            default: pgm.func('current_timestamp'),
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('user_album_likes');
};
