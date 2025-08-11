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
        try {
            this._validator.validateSongPayload(request.payload);
            const { title, year, genre, performer, duration, albumId } = request.payload;

            const songId = await this._service.addSong({ title, year, genre, performer, duration, albumId });

            const response = h.response({
                status: "success",
                message: "Song successfully added",
                data: {
                    songId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error.name === "InvariantError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message,
                    })
                    .code(400);
            }

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }

    async getSongById(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);

            if (!song) {
                return h
                    .response({
                        status: "error",
                        message: "Song not found",
                    })
                    .code(404);
            }

            const response = h.response({
                status: "success",
                data: {
                    song,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error.name === "NotFoundError") {
                const response = h.response({
                    status: "fail",
                    message: error.message, // Use the message from the error
                });
                response.code(404); // Set the HTTP status code to 404
                return response;
            }

            if (error.name === "InvariantError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message,
                    })
                    .code(400);
            }

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }

    async getAllSongs(request, h) {
        try {
            const { title, performer } = request.query;

            var songs = await this._service.getAllSongs();

            if (title || performer) {
                songs = await this._service.getSongsByQuery({ title, performer });
            }

            const response = h.response({
                status: "success",
                data: {
                    songs,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error.name === "InvariantError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message,
                    })
                    .code(400);
            }

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }

    async editSongById(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            const { title, year, genre, performer, duration, albumId } = request.payload;

            const songId = await this._service.editSongById(id, { title, year, genre, performer, duration, albumId });

            const response = h.response({
                status: "success",
                message: "Song successfully updated",
                data: {
                    songId,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error.name === "NotFoundError") {
                const response = h.response({
                    status: "fail",
                    message: error.message, // Use the message from the error
                });
                response.code(404); // Set the HTTP status code to 404
                return response;
            }

            if (error.name === "InvariantError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message,
                    })
                    .code(400);
            }

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }

    async deleteSongById(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);

            const response = h.response({
                status: "success",
                message: "Song successfully deleted",
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error.name === "NotFoundError") {
                const response = h.response({
                    status: "fail",
                    message: error.message, // Use the message from the error
                });
                response.code(404); // Set the HTTP status code to 404
                return response;
            }

            if (error.name === "InvariantError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message,
                    })
                    .code(400);
            }

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }
}

module.exports = SongHandler;
