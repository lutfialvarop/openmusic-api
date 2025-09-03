const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { service, validator, exportService, exportValidator }) => {
        const playlistHandler = new PlaylistHandler(service, validator, exportService, exportValidator);
        server.route(routes(playlistHandler));
    },
};
