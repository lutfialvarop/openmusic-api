class PlaylistHandler {
    constructor(service, validator, exportService, exportValidator) {
        this._service = service;
        this._validator = validator;
        this._exportService = exportService;
        this._exportValidator = exportValidator;

        this.addPlaylist = this.addPlaylist.bind(this);
        this.getPlaylist = this.getPlaylist.bind(this);
        this.deletePlaylistById = this.deletePlaylistById.bind(this);
        this.addSongOnPlaylistById = this.addSongOnPlaylistById.bind(this);
        this.getSongsOnPlaylistById = this.getSongsOnPlaylistById.bind(this);
        this.deleteSongsOnPlaylistById = this.deleteSongsOnPlaylistById.bind(this);
        this.getActivitiy = this.getActivitiy.bind(this);
        this.exportPlaylist = this.exportPlaylist.bind(this);
    }

    async addPlaylist(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

        return h
            .response({
                status: 'success',
                message: 'Playlist successfully added',
                data: {
                    playlistId,
                },
            })
            .code(201);
    }

    async getPlaylist(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylist(credentialId);
        return h
            .response({
                status: 'success',
                data: {
                    playlists,
                },
            })
            .code(200);
    }

    async deletePlaylistById(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id);

        return h
            .response({
                status: 'success',
                message: 'Playlist successfully deleted',
            })
            .code(200);
    }

    async addSongOnPlaylistById(request, h) {
        this._validator.validateSongPlaylistPayload(request.payload);

        const { id } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyCollabPlaylist(id, credentialId);
        const result = await this._service.addSongOnPlaylistById(id, songId);
        await this._service.insertActivitiy({ playlistID: id, songId, userId: credentialId, action: 'add' });

        return h
            .response({
                status: 'success',
                message: 'Songs successfully added to playlist',
                data: {
                    result,
                },
            })
            .code(201);
    }

    async getSongsOnPlaylistById(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyCollabPlaylist(id, credentialId);
        const playlist = await this._service.getPlaylistById(id);
        const songs = await this._service.getSongsOnPlaylistById(id);

        return h
            .response({
                status: 'success',
                data: {
                    playlist: {
                        ...playlist,
                        songs,
                    },
                },
            })
            .code(200);
    }

    async deleteSongsOnPlaylistById(request, h) {
        this._validator.validateSongPlaylistPayload(request.payload);

        const { id } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyCollabPlaylist(id, credentialId);
        await this._service.deleteSongsOnPlaylistById(songId, id);
        await this._service.insertActivitiy({ playlistID: id, songId, userId: credentialId, action: 'delete' });

        return h
            .response({
                status: 'success',
                message: 'Song on playlist successfully deleted',
            })
            .code(200);
    }

    async getActivitiy(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyCollabPlaylist(id, credentialId);
        const activities = await this._service.getActivitiy(id);

        return h
            .response({
                status: 'success',
                data: {
                    playlistId: id,
                    activities,
                },
            })
            .code(200);
    }

    async exportPlaylist(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        const { targetEmail } = request.payload;

        this._exportValidator.validateExportPlaylistPayload(request.payload);
        await this._service.verifyPlaylistOwner(id, credentialId);
        const playlist = await this._service.getPlaylistById(id);
        const songs = await this._service.getSongsOnPlaylistById(id);
        const message = {
            to: targetEmail,
            subject: 'Export Playlist',
            text: 'You have a new playlist export request',
            html: '<p>You have a new playlist export request</p>',
            attachments: [
                {
                    filename: 'playlist.json',
                    content: JSON.stringify({
                        playlist: {
                            ...playlist,
                            songs,
                        },
                    }),
                },
            ],
        };

        await this._exportService.sendMessage('export:playlists', JSON.stringify({ playlistId: id, targetEmail, message }));

        return h
            .response({
                status: 'success',
                message: 'Your request is being processed',
            })
            .code(201);
    }
}

module.exports = PlaylistHandler;
