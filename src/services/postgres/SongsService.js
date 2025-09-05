const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const id = `song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Song failed to add');
        }

        await this._cacheService.delete('songs');

        return result.rows[0].id;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT id, title, year, genre, performer, duration, album_id AS "albumId" FROM songs WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Song not found');
        }

        return result.rows[0];
    }

    async getAllSongs() {
        try {
            const result = await this._cacheService.get('songs');
            return {
                songs: JSON.parse(result),
                source: 'cache',
            };
        } catch {
            const query = {
                text: 'SELECT id, title, performer FROM songs',
            };

            const result = await this._pool.query(query);

            await this._cacheService.set('songs', JSON.stringify(result.rows));

            return {
                songs: result.rows,
                source: 'database',
            };
        }
    }

    async getSongsByQuery({ title, performer }) {
        let query = 'SELECT id, title, performer FROM songs';
        const conditions = [];
        const values = [];

        if (title !== undefined) {
            conditions.push('LOWER(title) ILIKE LOWER($1)');
            values.push(`%${title}%`);
        }
        if (performer !== undefined) {
            if (title !== undefined) {
                conditions.push('LOWER(performer) ILIKE LOWER($2)');
            } else {
                conditions.push('LOWER(performer) ILIKE LOWER($1)');
            }
            values.push(`%${performer}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const result = await this._pool.query({
            text: query,
            values,
        });

        return { songs: result.rows };
    }

    async editSongById(id, { title, year, genre, performer, duration, albumId }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to update song. Song not found.');
        }

        await this._cacheService.delete('songs');

        return result.rows[0].id;
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to delete song. Song not found.');
        }

        await this._cacheService.delete('songs');

        return result.rows[0].id;
    }
}

module.exports = SongsService;
