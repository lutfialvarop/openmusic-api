const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }

    async addCollab(playlistId, userId) {
        const id = `collaboration-${  nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, userId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Song failed to add');
        }

        return result.rows[0].id;
    }

    async deleteCollabById(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to delete collaborations. Collaborations not found.');
        }

        return result.rows[0].id;
    }

    async verifyCollab(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Collaboration failed to verify');
        }
    }
}

module.exports = CollaborationsService;
