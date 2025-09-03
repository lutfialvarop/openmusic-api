/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'playlists',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        create_at: {
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
    pgm.dropTable('collaborations');
};
