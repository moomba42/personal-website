import Database from "bun:sqlite";

export interface Post {
    id?: number;
    title: string;
    content: string;
    createdAt: Date;
}

export class PostsDatabase {
    private db: Database;

    constructor() {
        this.db = new Database("posts.db");
        this.init()
            .then(() => console.log("Database initialized"))
            .catch(console.error);
    }

    async list(): Promise<Post[]> {
        return this.db.query('SELECT * FROM posts').all() as Post[];
    }

    async add(post: Post): Promise<Post> {
        return this.db
            .query(`INSERT INTO posts (title, content, createdAt) VALUES ($title, $content, $createdAt)`)
            .get({$title: post.title, $content: post.content, $createdAt: post.createdAt.toDateString()}) as Post;
    }

    async init(): Promise<void> {
        return this.db.run('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, createdAt TIMESTAMP)');
    }

}