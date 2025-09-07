class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
        this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
        this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler(request, h) {
        this._validator.validatePostAuthenticationsPayload(request.payload);
        const { username, password } = request.payload;

        const id = await this._usersService.verifyUserCredential(username, password);

        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        await this._authenticationsService.addToken(refreshToken);

        return h
            .response({
                status: 'success',
                message: 'Authentication successfully added',
                data: {
                    accessToken,
                    refreshToken,
                },
            })
            .code(201);
    }

    async putAuthenticationHandler(request, h) {
        this._validator.validatePutAuthenticationsPayload(request.payload);
        const { refreshToken } = request.payload;

        await this._authenticationsService.verifyToken(refreshToken);

        const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

        const accessToken = this._tokenManager.generateAccessToken({ id });

        return h
            .response({
                status: 'success',
                message: 'Authentication successfully added',
                data: {
                    accessToken,
                },
            })
            .code(200);
    }

    async deleteAuthenticationHandler(request, h) {
        this._validator.validateDeleteAuthenticationsPayload(request.payload);

        const { refreshToken } = request.payload;

        await this._authenticationsService.verifyToken(refreshToken);
        await this._authenticationsService.deleteToken(refreshToken);

        return h
            .response({
                status: 'success',
                message: 'Token successfully deleted',
            })
            .code(200);
    }
}

module.exports = AuthenticationsHandler;
