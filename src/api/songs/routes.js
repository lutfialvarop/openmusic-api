const routes = (handler) => [
    {
        method: 'POST',
        path: '/songs',
        handler: handler.addSong,
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        handler: handler.getSongById,
    },
    {
        method: 'GET',
        path: '/songs',
        handler: handler.getAllSongs,
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        handler: handler.editSongById,
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        handler: handler.deleteSongById,
    },
];

module.exports = routes;
