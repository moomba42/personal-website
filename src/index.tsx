import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";
import { Post, PostsDatabase } from "./posts";

const app = new Elysia()
    .use(html())
    .decorate('db', new PostsDatabase())
    .get("/", ({html}) => html(
        <BaseHtml>
            <h2>Moomba's Seaside Port</h2>
            <h3>New post form</h3>
            <div class="section"><PostForm/></div>
            <h3>Posts</h3>
            <div class="section" hx-get="/posts" hx-trigger="load" hx-swap="innerHTML" id="posts"></div>
        </BaseHtml>
    ))
    .get("/posts", async ({db}) => <PostList posts={await db.list()}/>)
    .post("/posts", async ({db, body}) => {
        await db.add({
            title: body.title,
            content: body.content,
            createdAt: new Date(body.createdAt)
        }).catch(console.error);
        return <PostList posts={await db.list()}/>;
    })
    .get("/styles.css", () => Bun.file("src/styles.css"))
    .listen(3000);

const BaseHtml = ({children}: elements.Children) => "<!DOCTYPE html>" + (
    <html lang="en">
    <head>
        <title>Moomba's Seaside Port</title>
        <link rel="stylesheet" href="styles.css"/>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </head>
    <body>
    {children}
    </body>
    </html>
);

const PostItem = ({title, content, createdAt}: Post) => (
    <div class="post">
        <h3>{title}</h3>
        <p>{content}</p>
        <sub>{createdAt}</sub>
    </div>
);

const PostList = ({posts}: { posts: Post[] }) => (
    <div>
        {posts.map((post) => <PostItem {...post}/>)}
    </div>
)

const PostForm = () => (
    <form hx-post="/posts" hx-target="#posts">
        <input id="title" name="title" type="text" placeholder="New post title"/>
        <textarea id="content" name="content" placeholder="Type post content here" cols="80"></textarea>
        <input type="hidden" name="createdAt" value={new Date(Date.now()).toISOString()}/>
        <input type="submit" value="Submit"/>
    </form>
)

