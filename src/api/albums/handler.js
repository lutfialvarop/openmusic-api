class AlbumHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.addAlbum = this.addAlbum.bind(this);
        this.getAlbumById = this.getAlbumById.bind(this);
        this.editAlbumById = this.editAlbumById.bind(this);
        this.deleteAlbumById = this.deleteAlbumById.bind(this);
    }

    async addAlbum(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { name, year } = request.payload;

            const albumId = await this._service.addAlbum({ name, year });

            const response = h.response({
                status: "success",
                message: "Album successfully added",
                data: {
                    albumId,
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

    async getAlbumById(request, h) {
        try {
            const { id } = request.params;
            const album = await this._service.getAlbumById(id);

            if (!album) {
                return h
                    .response({
                        status: "error",
                        message: "Album not found",
                    })
                    .code(404);
            }

            const response = h.response({
                status: "success",
                data: {
                    album,
                },
            });
            response.code(200);
            return response;
        } catch (error) {
            if (error.name === "NotFoundError") {
                return h
                    .response({
                        status: "fail",
                        message: error.message, // Use the message from the error
                    })
                    .code(404); // Set the HTTP status code to 404
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

    async deleteAlbumById(request, h) {
        try {
            const { id } = request.params;

            await this._service.deleteAlbumById(id);

            const response = h.response({
                status: "success",
                message: "Album successfully deleted",
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

            return h
                .response({
                    status: "error",
                    message: error.message,
                })
                .code(500);
        }
    }

    async editAlbumById(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            const { name, year } = request.payload;

            await this._service.editAlbumById(id, { name, year });

            const response = h.response({
                status: "success",
                message: "Album successfully updated",
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

module.exports = AlbumHandler;
