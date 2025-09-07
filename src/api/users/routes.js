const routes = (handler) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.addUser,
    },
];

module.exports = routes;
