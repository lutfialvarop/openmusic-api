class AlbumHandler {
    constructor(service, validator, serviceUpload, uploadsValidator) {
        this._service = service;
        this._validator = validator;
        this._serviceUpload = serviceUpload;
        this._uploadsValidator = uploadsValidator;

        this.addAlbum = this.addAlbum.bind(this);
        this.getAlbumById = this.getAlbumById.bind(this);
        this.editAlbumById = this.editAlbumById.bind(this);
        this.deleteAlbumById = this.deleteAlbumById.bind(this);
        this.likeAlbum = this.likeAlbum.bind(this);
        this.unlikeAlbum = this.unlikeAlbum.bind(this);
        this.getAlbumLikes = this.getAlbumLikes.bind(this);
        this.addAlbumCover = this.addAlbumCover.bind(this);
    }

    async addAlbum(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });

        return h
            .response({
                status: 'success',
                message: 'Album successfully added',
                data: {
                    albumId,
                },
            })
            .code(201);
    }

    async getAlbumById(request, h) {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);

        const response = h.response({
            status: 'success',
            data: {
                album: album.album,
            },
        });

        if (album.source == 'cache') {
            response.header('X-Data-Source', 'cache');
        }

        return response.code(200);
    }

    async deleteAlbumById(request, h) {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        return h
            .response({
                status: 'success',
                message: 'Album successfully deleted',
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
                status: 'success',
                message: 'Album successfully updated',
            })
            .code(200);
    }

    async likeAlbum(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.getAlbumById(id);
        await this._service.likeAlbum(id, credentialId);

        return h
            .response({
                status: 'success',
                message: 'Album successfully liked',
            })
            .code(201);
    }

    async unlikeAlbum(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.unlikeAlbum(id, credentialId);

        return h
            .response({
                status: 'success',
                message: 'Album successfully unliked',
            })
            .code(200);
    }

    async getAlbumLikes(request, h) {
        const { id } = request.params;

        const data = await this._service.getAlbumLikes(id);

        const response = h.response({
            status: 'success',
            data: {
                likes: data.likes,
            },
        });

        if (data.source == 'cache') {
            response.header('X-Data-Source', 'cache');
        }

        return response.code(200);
    }

    async addAlbumCover(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;

        this._uploadsValidator.validateImageHeaders(cover.hapi.headers);
        await this._service.getAlbumById(id);
        const filename = await this._serviceUpload.writeFile(cover, cover.hapi);
        const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;
        await this._service.addAlbumCover(id, fileLocation);

        return h
            .response({
                status: 'success',
                message: 'Cover image successfully uploaded',
            })
            .code(201);
    }
}

module.exports = AlbumHandler;
