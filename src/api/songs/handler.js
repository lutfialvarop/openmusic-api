class SongHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.addSong = this.addSong.bind(this);
        this.getSongById = this.getSongById.bind(this);
        this.getAllSongs = this.getAllSongs.bind(this);
        this.editSongById = this.editSongById.bind(this);
        this.deleteSongById = this.deleteSongById.bind(this);
    }

    async addSong(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { title, year, genre, performer, duration, albumId } = request.payload;

        const songId = await this._service.addSong({ title, year, genre, performer, duration, albumId });

        return h
            .response({
                status: "success",
                message: "Song successfully added",
                data: {
                    songId,
                },
            })
            .code(201);
    }

    async getSongById(request, h) {
        const { id } = request.params;
        const song = await this._service.getSongById(id);

        return h
            .response({
                status: "success",
                data: {
                    song,
                },
            })
            .code(200);
    }

    async getAllSongs(request, h) {
        const { title, performer } = request.query;

        var songs = await this._service.getAllSongs();

        if (title || performer) {
            songs = await this._service.getSongsByQuery({ title, performer });
        }

        return h
            .response({
                status: "success",
                data: {
                    songs,
                },
            })
            .code(200);
    }

    async editSongById(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { id } = request.params;
        const { title, year, genre, performer, duration, albumId } = request.payload;

        const songId = await this._service.editSongById(id, { title, year, genre, performer, duration, albumId });

        return h
            .response({
                status: "success",
                message: "Song successfully updated",
                data: {
                    songId,
                },
            })
            .code(200);
    }

    async deleteSongById(request, h) {
        const { id } = request.params;
        await this._service.deleteSongById(id);

        return h
            .response({
                status: "success",
                message: "Song successfully deleted",
            })
            .code(200);
    }
}

module.exports = SongHandler;
