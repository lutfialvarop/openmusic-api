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
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });

        return h
            .response({
                status: "success",
                message: "Album successfully added",
                data: {
                    albumId,
                },
            })
            .code(201);
    }

    async getAlbumById(request, h) {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);

        return h
            .response({
                status: "success",
                data: {
                    album,
                },
            })
            .code(200);
    }

    async deleteAlbumById(request, h) {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        return h
            .response({
                status: "success",
                message: "Album successfully deleted",
            })
            .code(200);
    }

    async editAlbumById(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;
        const { name, year } = request.payload;

        await this._service.editAlbumById(id, { name, year });

        return h
            .response({
                status: "success",
                message: "Album successfully updated",
            })
            .code(200);
    }
}

module.exports = AlbumHandler;
