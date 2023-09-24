import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";
import { Post, PostsDatabase } from "./posts";
import * as sass from "sass";

const app = new Elysia()
    .use(html())
    .decorate('db', new PostsDatabase("posts"))
    .get("/", ({set}) => set.redirect = "/posts")
    .get("/posts", ({html}) => html(
        <BaseHtml>
            <div class="content">
                <div id="header">
                    <div class="title">Moomba's Seaside Port</div>
                    <div class="navigation flex-row items-start gap-9">
                        <ul>
                            <li>Posts</li>
                            <li>About Me</li>
                            <li>Gallery</li>
                        </ul>
                        <ul>
                            <li>#all</li>
                            <li>#shadowhaven</li>
                            <li>#tgom</li>
                        </ul>
                    </div>
                    <img class="art" src="/art/art1@2x.png" alt="A road leading to a castle in the distance."/>
                </div>
                <div id="posts" hx-get="/api/posts" hx-trigger="load" hx-swap="innerHTML"></div>
                <div id="table-of-contents" class="flex-col items-start gap-4">
                    <h1>Table of contents</h1>
                    <div class="flex-row flex-wrap whitespace-nowrap gap-3">
                        <a href="#">#all</a>
                        <a href="#">#java</a>
                        <a href="#">#c++</a>
                        <a href="#">#godot</a>
                        <a href="#">#unity3d</a>
                        <a href="#">#python</a>
                        <a href="#">#photoshop</a>
                        <a href="#">#substance-painter</a>
                        <a href="#">#blender</a>
                        <a href="#">#animation</a>
                        <a href="#">#web-design</a>
                        <a href="#">#beginner</a>
                        <a href="#">#shadowhaven</a>
                        <a href="#">#tgom</a>
                    </div>
                </div>
                <div id="footer" class="flex-col">
                    <div class="cut-line"></div>
                    <div class="flex-row items-start justify-between p-5">
                        <div class="flex-col items-start gap-4">
                            <p>© 2023 Aleksander Długosz</p>
                            <q>Raiders roll</q>
                        </div>
                        <div class="flex-col items-start gap-5">
                            <a class="link-email" href="mailto:olekdlugi@gmail.com"
                               target="_blank">olekdlugi@gmail.com</a>
                            <a class="link-phone" href="tel:+48505873740" target="_blank">+48 505 873 740</a>
                            <a class="link-linkedin" href="https://www.linkedin.com/in/adlugosz/"
                               target="_blank">in/adlugosz</a>
                        </div>
                    </div>
                </div>
            </div>
        </BaseHtml>
    ))
    .get("/admin", ({html}) => html(
        <BaseHtml>
            <h3>New post form</h3>
            <div class="section"><PostForm/></div>
        </BaseHtml>
    ))
    .get("/api/posts", async ({db}) => <PostList posts={await db.list()}/>)
    .get("/styles.css", () =>
        new Response(sass.compile("styles/all.scss").css, {headers: {'Content-Type': 'text/css'}})
    )
    .get("/art/:file", ({params: {file}}) => Bun.file(`art/${file}`))
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

const PostItem = ({contentHtml, tags, createdAt}: Post) => (
    <div class="post">
        <small>{createdAt}</small>
        <small>{tags}</small>
        <div>
            {contentHtml}
        </div>
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
