const routes = (handler) => [
    {
        method: 'POST',
        path: '/collaborations',
        handler: handler.addCollab,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/collaborations',
        handler: handler.deleteCollabById,
        options: {
            auth: 'openmusic_jwt',
        },
    },
];

module.exports = routes;
