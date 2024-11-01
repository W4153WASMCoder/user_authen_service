import pool from "../db.js";
import type { RowDataPacket } from "mysql2";

export class User {
    UserID: number | null;
    sub: string; // Unique identifier from the OpenID provider
    email: string;
    name: string;
    picture: string;
    lastLogin: Date;

    constructor(
        UserID: number | null,
        sub: string,
        email: string,
        name: string,
        picture: string,
        lastLogin: Date,
    ) {
        this.UserID = UserID;
        this.sub = sub;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.lastLogin = lastLogin;
    }
    async update(): Promise<void> {
        try {
            if (!this.UserID)
                throw new Error("Cannot update a user without UserID");
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
        const { UserID, sub, email, name, picture, lastLogin } =
            await User.createOrUpdate(this);

        this.UserID = UserID;
        this.sub = sub;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.lastLogin = lastLogin;
    }
    static async deleteById(id: number): Promise<boolean> {
        try {
            // Check if user exists
            const [rows] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM users WHERE user_id = ?",
                [id],
            );

            if (rows.length === 0) {
                // Return false if the user does not exist
                return false;
            }

            // Proceed to delete the user
            await pool.query("DELETE FROM users WHERE user_id = ?", [id]);
            return true;
        } catch (error) {
            // Log the error for debugging
            console.error("Error deleting user by ID:", error);

            // Return false in case of an error
            return false;
        }
    }

    // Create or update user based on OpenID Connect information
    static async createOrUpdate(userData: {
        sub: string;
        email: string;
        name: string;
        picture: string;
    }): Promise<User> {
        try {
            const { sub, email, name, picture } = userData;

            // Check if user exists
            const [rows] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM users WHERE sub = ?",
                [sub],
            );
            if (rows.length > 0) {
                // User exists, update their info
                const { UserID } = rows[0] as { UserID: number };
                await pool.query(
                    "UPDATE users SET email = ?, name = ?, picture = ?, lastLogin = ? WHERE user_id = ?",
                    [email, name, picture, new Date(), UserID],
                );
                return new User(UserID, sub, email, name, picture, new Date());
            }

            // User doesn't exist, create a new record
            const [result]: any = await pool.query(
                "INSERT INTO users (sub, email, name, picture, lastLogin) VALUES (?, ?, ?, ?, ?)",
                [sub, email, name, picture, new Date()],
            );
            const UserID = result.insertId;
            return new User(UserID, sub, email, name, picture, new Date());
        } catch (error) {
            console.error("Error creating or updating user:", error);
            throw error;
        }
    }
    // Find user by UserID
    static async findById(UserID: number): Promise<User | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM users WHERE user_id = ?",
                [UserID],
            );
            if (rows.length === 0) return null;

            const { sub, email, name, picture, lastLogin } = rows[0] as {
                sub: string;
                email: string;
                name: string;
                picture: string;
                lastLogin: Date;
            };
            return new User(
                UserID,
                sub,
                email,
                name,
                picture,
                new Date(lastLogin),
            );
        } catch (error) {
            console.error(`Error fetching User with ID ${UserID}:`, error);
            return null;
        }
    }

    // Fetch users with pagination
    static async findAll({
        limit,
        offset,
        UserName,
    }: {
        limit: number;
        offset: number;
        UserName: string | undefined;
    }): Promise<{ users: User[]; total: number }> {
        try {
            let filterClauses = "";
            let filterValues = [];
            if (UserName) {
                filterClauses += " AND name LIKE ?";
                filterValues.push(`%${UserName}%`);
            }
            // Get total count
            const [countRows] = await pool.query<RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM users WHERE 1=1 ${filterClauses}`,
                filterValues,
            );
            const total = countRows[0].total;

            // Get users with limit and offset
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT * FROM users WHERE 1=1 ${filterClauses} LIMIT ? OFFSET ?`,
                [...filterValues, limit, offset],
            );

            const users = rows.map((row) => {
                const { user_id, sub, email, name, picture, lastLogin } = row;
                return new User(
                    user_id,
                    sub,
                    email,
                    name,
                    picture,
                    new Date(lastLogin),
                );
            });

            return { users, total };
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    // Convert User to JSON-compatible format
    toJSON(): string {
        return JSON.stringify({
            UserID: this.UserID,
            sub: this.sub,
            email: this.email,
            name: this.name,
            picture: this.picture,
            lastLogin: this.lastLogin,
        });
    }
}

export class ActiveToken {
    TokenID: number | null;
    UserID: number;
    TTL: number;
    CreationDate: Date;

    constructor(
        TokenID: number | null,
        UserID: number,
        TTL: number = 3600,
        CreationDate: Date = new Date(),
    ) {
        this.TokenID = TokenID;
        this.UserID = UserID;
        this.TTL = TTL;
        this.CreationDate = CreationDate;
    }

    // Save the token to the database
    async save(): Promise<ActiveToken> {
        if (this.TokenID) {
            // Update an existing token
            await pool.query(
                "UPDATE active_tokens SET user_id = ?, ttl = ?, create_date = ? WHERE token_id = ?",
                [this.UserID, this.TTL, this.CreationDate, this.TokenID],
            );
            return this;
        }
        // Insert a new token
        const [result]: any = await pool.query(
            "INSERT INTO active_tokens (user_id, ttl, create_date) VALUES (?, ?, ?)",
            [this.UserID, this.TTL, this.CreationDate],
        );
        this.TokenID = result.insertId; // MySQL returns the new ID
        return this;
    }

    // Find a token by its TokenID
    static async findById(TokenID: number): Promise<ActiveToken | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM active_tokens WHERE token_id = ?",
            [TokenID],
        );
        if (rows.length === 0) return null;

        const { user_id, ttl, create_date } = rows[0] as {
            user_id: number;
            ttl: number;
            create_date: Date;
        };
        return new ActiveToken(TokenID, user_id, ttl, new Date(create_date));
    }

    // Check if the token is still valid based on TTL and CreationDate
    isValid(): boolean {
        const currentTime = new Date().getTime();
        const creationTime = this.CreationDate.getTime();
        return currentTime - creationTime < this.TTL * 1000;
    }

    static async findAll(
        limit: number,
        offset: number,
    ): Promise<{ tokens: ActiveToken[]; total: number }> {
        try {
            // Get total count
            const [countRows] = await pool.query<RowDataPacket[]>(
                "SELECT COUNT(*) as total FROM active_tokens",
            );
            const total = countRows[0].total;

            // Get tokens with limit and offset
            const [rows] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM active_tokens LIMIT ? OFFSET ?",
                [limit, offset],
            );

            const tokens = rows.map((row) => {
                const { token_id, user_id, ttl, create_date } = row;
                return new ActiveToken(
                    token_id,
                    user_id,
                    ttl,
                    new Date(create_date),
                );
            });

            return { tokens, total };
        } catch (error) {
            console.error("Error fetching active tokens:", error);
            throw error;
        }
    }

    // Convert ActiveToken instance to JSON-compatible format
    toJSON(): string {
        return JSON.stringify({
            TokenID: this.TokenID,
            UserID: this.UserID,
            TTL: this.TTL,
            CreationDate: this.CreationDate,
        });
    }
}
