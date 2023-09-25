import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";
import { Post, PostsDatabase } from "./posts";
import * as sass from "sass";
import { TagsDatabase } from "./tags";

const app = new Elysia()
    .use(html())
    .decorate('posts', new PostsDatabase("posts"))
    .decorate('tags', new TagsDatabase("posts"))
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
                    <div hx-get="/api/tags" hx-trigger="load" hx-swap="outerHTML">Loading...</div>
                </div>
                <div id="footer" class="flex-col">
                    <div class="cut-line"></div>
                    <div class="flex-row items-start justify-between p-5">
                        <div class="flex-col items-start gap-4">
                            <p>© 2023 Aleksander Długosz</p>
                            <p><q>Raiders roll</q></p>
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
    .get("/api/posts", async ({posts}) => <PostList posts={await posts.list()}/>)
    .get("/api/tags", async ({tags}) => <TagsList tags={await tags.list()}/>)
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
        <div class="post__content">
            {contentHtml}
        </div>
    </div>
);

const PostList = ({posts}: { posts: Post[] }) => (
    <div>
        {posts.map((post) => <PostItem {...post}/>)}
    </div>
)

const TagsList = ({tags}: { tags: string[] }) => (
    <div class="flex-row flex-wrap whitespace-nowrap gap-3">
        {tags.map((tag) => <a href="#">#{tag}</a>)}
    </div>
)