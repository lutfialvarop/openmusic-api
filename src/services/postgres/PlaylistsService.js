const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(songsService, collaborationsService) {
        this._pool = new Pool();
        this._songsService = songsService;
        this._collaborationsService = collaborationsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${  nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, owner, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Playlist failed to add');
        }

        return result.rows[0].id;
    }

    async getPlaylist(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
            LEFT JOIN users ON users.id = playlists.owner 
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to delete playlist. Playlist not found.');
        }
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
            JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist not found');
        }

        return result.rows[0];
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist not found.');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthorizationError("You can't access this resource");
        }
    }

    async verifyCollabPlaylist(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationsService.verifyCollab(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addSongOnPlaylistById(playlistId, songId) {
        const id = `playlistsong-${  nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        await this._songsService.getSongById(songId);

        const query = {
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, songId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Song failed to be added to playlist');
        }

        return result.rows[0].id;
    }

    async getSongsOnPlaylistById(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM songs 
            LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
            WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deleteSongsOnPlaylistById(songId, playlistId) {
        await this._songsService.getSongById(songId);

        const query = {
            text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
            values: [songId, playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Failed to delete song on playlist. Song on playlist not found.');
        }
    }

    async insertActivitiy({ playlistID, songId, userId, action }) {
        const id = `activity-${  nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, playlistID, songId, userId, action, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Activity playlist failed to add');
        }
    }

    async getActivitiy(playlistID) {
        const query = {
            text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.create_at AS time 
            FROM playlist_song_activities 
            INNER JOIN users ON users.id = playlist_song_activities.user_id 
            INNER JOIN songs ON songs.id = playlist_song_activities.song_id 
            WHERE playlist_song_activities.playlist_id = $1`,
            values: [playlistID],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Activity not found');
        }

        return result.rows;
    }
}

module.exports = PlaylistsService;
