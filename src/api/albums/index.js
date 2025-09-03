const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'albums',
    version: '1.0.0',
    register: async (server, { service, validator, serviceUpload, uploadsValidator }) => {
        const albumHandler = new AlbumHandler(service, validator, serviceUpload, uploadsValidator);
        server.route(routes(albumHandler));
    },
};
