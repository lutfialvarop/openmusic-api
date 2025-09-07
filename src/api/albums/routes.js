const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.addAlbum,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumById,
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.editAlbumById,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumById,
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.likeAlbum,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        handler: handler.unlikeAlbum,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getAlbumLikes,
    },
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.addAlbumCover,
        options: {
            payload: {
                allow: 'multipart/form-data',
                maxBytes: 512000, // 500 KB
                output: 'stream',
                multipart: true,
                parse: true,
            },
        },
    },
    {
        method: 'GET',
        path: '/uploads/covers/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'uploads/covers'),
            },
        },
    },
];

module.exports = routes;
