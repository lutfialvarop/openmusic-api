const routes = (handler) => [
    {
        method: "POST",
        path: "/albums",
        handler: handler.addAlbum,
    },
    {
        method: "GET",
        path: "/albums/{id}",
        handler: handler.getAlbumById,
    },
    {
        method: "PUT",
        path: "/albums/{id}",
        handler: handler.editAlbumById,
    },
    {
        method: "DELETE",
        path: "/albums/{id}",
        handler: handler.deleteAlbumById,
    },
];

module.exports = routes;
