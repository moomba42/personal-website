import { Elysia } from "elysia";
import { html, Html, Children } from "@elysiajs/html";
import { Post, PostsDatabase } from "./posts";
import * as sass from "sass";
import { TagsDatabase } from "./tags";

const app = new Elysia()
    .use(html())
    .decorate('posts', new PostsDatabase("posts"))
    .decorate('tags', new TagsDatabase("posts"))
    .get("/", ({redirect}) => redirect("/construction"))
    .get("/construction", () =>
        <BaseHtml>
            <div class="content">
                <div id="header">
                    <h1 class="title">The Lumber Mill</h1>
                    <h4>Road to Shadowhaven</h4>
                </div>
                <div>
                    <img style="max-width: 80vw;" src="/resources/art2@2x.png" alt="A lumber mill owner staring at you, with a house and mountains in the distance."/>
                    <div style="height: 64px;"></div>
                    <h4>The worker turns to you and tells you:</h4>
                    <div style="height: 8px;"></div>
                    <p>This site is still under construction.</p>
                    <p>Please come back later.</p>
                </div>
                <Footer/>
            </div>
        </BaseHtml>
    )
    .get("/posts", async ({posts, tags, html, query}) => html(
        <BaseHtml>
            <div class="content">
                <Header selectedTag={query.tag ?? undefined}/>
                <PostList posts={await posts.list(query.tag)}/>
                <div id="table-of-contents" class="flex-col items-start gap-4">
                    <h1>Table of contents</h1>
                    <TagsList tags={await tags.list()} selected={query.tag}/>
                </div>
                <Footer/>
            </div>
        </BaseHtml>
    ))
    .get("/api/posts", async ({posts, query}) => <PostList posts={await posts.list(query.tag)}/>)
    .get("/api/tags", async ({tags, query}) => <TagsList tags={await tags.list()} selected={query.tag}/>)
    .get("/styles.css", () =>
        new Response(sass.compile("styles/all.scss").css, {headers: {'Content-Type': 'text/css'}})
    )
    .get("/resources/:file", ({params: {file}}) => Bun.file(`resources/${file}`))
    .listen(3000, ({ hostname, port }) => {
        console.log(`🔗 Running at http://${hostname}:${port}`)
    });

const BaseHtml = ({children}: Children) => "<!DOCTYPE html>" + (
    <html lang="en">
    <head>
        <title>Moomba's Seaside Port</title>
        <meta name="darkreader-lock"/>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"/>
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
        <small>{createdAt.toLocaleString()}</small>
        <div class="post__content">
            {contentHtml}
            <TagsList tags={tags}/>
        </div>
    </div>
);

const PostList = ({posts}: { posts: Post[] }) => (
    <div id="posts">
        {posts.map((post) => <PostItem {...post}/>)}
    </div>
)

const TagsList = ({tags, selected}: { tags: string[], selected?: string | null }) => (
    <div class="flex-row flex-wrap whitespace-nowrap gap-3">
        {tags.map((tag) => <a href={"?tag=" + tag} class={tag === selected ? 'selected' : ''}>{"#"+tag}</a>)}
    </div>
)

const Header = ({selectedTag}: {selectedTag?: string}) => (
    <div id="header">
        <div class="title">Moomba's Seaside Port</div>
        <div class="navigation flex-row items-start gap-9">
            <ul>
                <li><a href="/posts">Posts</a></li>
                <li><a href="/about-me">About Me</a></li>
                <li><a href="/gallery">Gallery</a></li>
            </ul>
            <ul>
                <li><a href="/posts" class={!selectedTag ? 'selected' : ''}>#all</a></li>
                <li><a href="/posts?tag=shadowhaven" class={selectedTag == 'shadowhaven' ? 'selected' : ''}>#shadowhaven</a></li>
                <li><a href="/posts?tag=tgom" class={selectedTag == 'tgom' ? 'selected' : ''}>#tgom</a></li>
            </ul>
        </div>
        <img class="art" src="/resources/art1@2x.png" alt="A road leading to a castle in the distance."/>
    </div>
);

const Footer = () => (
    <div id="footer" class="flex-col">
        <div class="cut-line"></div>
        <div class="flex-row items-start justify-between p-5">
            <div class="flex-col items-start gap-4">
                <p>© 2023 Aleksander Długosz</p>
                <p><q>Raiders roll</q></p>
            </div>
            <div class="flex-col items-start gap-5 gap-phone-2">
                <a class="link-email" href="mailto:olekdlugi@gmail.com"
                   target="_blank">olekdlugi@gmail.com</a>
                <a class="link-phone" href="tel:+48505873740" target="_blank">+48 505 873 740</a>
                <a class="link-linkedin" href="https://www.linkedin.com/in/adlugosz/"
                   target="_blank">in/adlugosz</a>
            </div>
        </div>
    </div>
);
