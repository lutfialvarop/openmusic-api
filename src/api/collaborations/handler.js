class CollaborationHandler {
    constructor(service, playlistsService, usersService, validator) {
        this._service = service;
        this._playlistService = playlistsService;
        this._userService = usersService;
        this._validator = validator;

        this.addCollab = this.addCollab.bind(this);
        this.deleteCollabById = this.deleteCollabById.bind(this);
    }

    async addCollab(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { playlistId, userId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._userService.verifyUser(userId);
        const collaborationId = await this._service.addCollab(playlistId, userId);

        return h
            .response({
                status: "success",
                message: "Collaboration successfully added",
                data: {
                    collaborationId,
                },
            })
            .code(201);
    }

    async deleteCollabById(request, h) {
        this._validator.validateCollaborationPayload(request.payload);
        const { playlistId, userId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._userService.verifyUser(userId);
        await this._service.deleteCollabById(playlistId, userId);

        return h
            .response({
                status: "success",
                message: "Collaboration successfully deleted",
            })
            .code(200);
    }
}

module.exports = CollaborationHandler;
