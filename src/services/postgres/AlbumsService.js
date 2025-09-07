const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, name, year, null, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Album failed to add');
        }

        await this._cacheService.delete(`album:${id}`);

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        try {
            const result = await this._cacheService.get(`album:${id}`);

            return {
                album: JSON.parse(result),
                source: 'cache',
            };
        } catch {
            const query = {
                text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
                values: [id],
            };

            const result = await this._pool.query(query);

            if (!result.rows.length) {
                throw new NotFoundError('Album not found');
            }

            const songsQuery = {
                text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
                values: [id],
            };
            const songsResult = await this._pool.query(songsQuery);

            const album = result.rows[0];
            album.coverUrl = album.cover_url;
            delete album.cover_url;
            album.songs = songsResult.rows;

            await this._cacheService.set(`album:${id}`, JSON.stringify(album), 3600);

            return {
                album,
                source: 'database',
            };
        }
    }

    async editAlbumById(id, { name, year }) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to update album. Album not found.');
        }

        await this._cacheService.delete(`album:${id}`);

        return result.rows[0].id;
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to delete album. Album not found.');
        }

        await this._cacheService.delete(`album:${id}`);

        return result.rows[0].id;
    }

    async verifyAlbum(id, userId) {
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [id, userId],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('Album already liked');
        }
    }

    async likeAlbum(id, userId) {
        await this.verifyAlbum(id, userId);
        const likeId = `like-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [likeId, userId, id, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Failed to like album');
        }

        await this._cacheService.delete(`album_likes:${id}`);

        return result.rows[0].id;
    }

    async unlikeAlbum(id, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [id, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to unlike album. Album not found.');
        }

        await this._cacheService.delete(`album_likes:${id}`);

        return result.rows[0].id;
    }

    async getAlbumLikes(id) {
        try {
            const result = await this._cacheService.get(`album_likes:${id}`);
            return {
                likes: parseInt(result, 10),
                source: 'cache',
            };
        } catch {
            const query = {
                text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
                values: [id],
            };

            const result = await this._pool.query(query);

            if (!result.rows.length) {
                throw new NotFoundError('Album not found');
            }

            const likes = parseInt(result.rows[0].likes, 10);

            await this._cacheService.set(`album_likes:${id}`, likes, 1800);

            return {
                likes,
                source: 'database',
            };
        }
    }

    async addAlbumCover(id, coverUrl) {
        const query = {
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Failed to add album cover. Album not found.');
        }

        await this._cacheService.delete(`album:${id}`);

        return result.rows[0].id;
    }
}

module.exports = AlbumsService;
