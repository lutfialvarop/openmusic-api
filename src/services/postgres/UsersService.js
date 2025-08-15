const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const AuthenticationError = require("../../exceptions/AuthenticationError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
    constructor() {
        this._pool = new Pool();
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: "SELECT id, password FROM users WHERE username = $1",
            values: [username],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError("Username and password not valid");
        }

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError("Username and password not valid");
        }

        return id;
    }

    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username);

        const id = "user-" + nanoid(16);
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            values: [id, username, hashedPassword, fullname, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("User failed to add");
        }

        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: "SELECT username FROM users WHERE username = $1",
            values: [username],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError("Username has been used");
        }
    }

    async verifyUser(userId) {
        const query = {
            text: "SELECT username FROM users WHERE id = $1",
            values: [userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("User not found");
        }
    }
}

module.exports = UsersService;
