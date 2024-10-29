import pool from '../db.js';
import type { RowDataPacket } from 'mysql2';

export class User {
    UserID: number | null;
    sub: string; // Unique identifier from the OpenID provider
    email: string;
    name: string;
    picture: string;
    lastLogin: Date;

    constructor(UserID: number | null, sub: string, email: string, name: string, picture: string, lastLogin: Date) {
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
            throw new Error('Cannot update a user without UserID');
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
        const { UserID, sub, email, name, picture, lastLogin} = await User.createOrUpdate(this);

        this.UserID = UserID;
        this.sub = sub;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.lastLogin = lastLogin;
      }
    // Create or update user based on OpenID Connect information
    static async createOrUpdate(userData: { sub: string; email: string; name: string; picture: string; }): Promise<User> {
        try {
            const { sub, email, name, picture } = userData;

            // Check if user exists
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE sub = ?', [sub]);
            if (rows.length > 0) {
                // User exists, update their info
                const { UserID } = rows[0] as { UserID: number };
                await pool.query('UPDATE Users SET email = ?, name = ?, picture = ?, lastLogin = ? WHERE UserID = ?', [
                    email,
                    name,
                    picture,
                    new Date(),
                    UserID
                ]);
                return new User(UserID, sub, email, name, picture, new Date());
            }
                
            // User doesn't exist, create a new record
            const [result]: any = await pool.query(
                'INSERT INTO Users (sub, email, name, picture, lastLogin) VALUES (?, ?, ?, ?, ?)',
                [sub, email, name, picture, new Date()]
            );
            const UserID = result.insertId;
            return new User(UserID, sub, email, name, picture, new Date());

        } catch (error) {
            console.error('Error creating or updating user:', error);
            throw error;
        }
    }

    // Find user by UserID
    static async findById(UserID: number): Promise<User | null> {
        try {
            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE UserID = ?', [UserID]);
            if (rows.length > 0) {
                const { sub, email, name, picture, lastLogin } = rows[0] as { sub: string; email: string; name: string; picture: string; lastLogin: Date };
                return new User(UserID, sub, email, name, picture, new Date(lastLogin));
            }

            return null;
        } catch (error) {
            console.error(`Error fetching User with ID ${UserID}:`, error);
            return null;
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
            lastLogin: this.lastLogin
        });
    }
}

export class ActiveToken {
    TokenID: number | null;
    UserID: number;
    TTL: number;
    CreationDate: Date;

    constructor(TokenID: number | null, UserID: number, TTL: number = 3600, CreationDate: Date = new Date()) {
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
                'UPDATE ActiveTokens SET UserID = ?, TTL = ?, CreationDate = ? WHERE TokenID = ?',
                [this.UserID, this.TTL, this.CreationDate, this.TokenID]
            );
            return this;
        }
        // Insert a new token
        const [result]: any = await pool.query(
            'INSERT INTO ActiveTokens (UserID, TTL, CreationDate) VALUES (?, ?, ?)',
            [this.UserID, this.TTL, this.CreationDate]
        );
        this.TokenID = result.insertId; // MySQL returns the new ID
        return this;
    }

    // Find a token by its TokenID
    static async findById(TokenID: number): Promise<ActiveToken | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ActiveTokens WHERE TokenID = ?', [TokenID]);
        if (rows.length === 0) return null;
        
        const { UserID, TTL, CreationDate } = rows[0] as { UserID: number; TTL: number; CreationDate: Date };
        return new ActiveToken(TokenID, UserID, TTL, new Date(CreationDate));
    }

    // Check if the token is still valid based on TTL and CreationDate
    isValid(): boolean {
        const currentTime = new Date().getTime();
        const creationTime = this.CreationDate.getTime();
        return currentTime - creationTime < this.TTL * 1000;
    }

    // Convert ActiveToken instance to JSON-compatible format
    toJSON(): string {
        return JSON.stringify({
            TokenID: this.TokenID,
            UserID: this.UserID,
            TTL: this.TTL,
            CreationDate: this.CreationDate
        });
    }
}
