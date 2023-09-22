import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";
import { Post, PostsDatabase } from "./posts";
import * as sass from "sass";

const stylesCompiled = sass.compile("src/styles.scss").css;

const app = new Elysia()
    .use(html())
    .decorate('db', new PostsDatabase())
    .get("/", ({set}) => set.redirect = "/posts")
    .get("/posts", ({html}) => html(
        <BaseHtml>
            <div class="content">
                <div id="header">
                    <div class="title">Moomba's Seaside Port</div>
                    <div class="navigation">
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
                <div id="table-of-contents">
                    <h1>Table of contents</h1>
                    <div class="table-of-contents__tags">
                        <a href="#">#all</a>
                        <a href="#">#java</a>
                        <a href="#">#c++</a>
                        <a href="#">#godot</a>
                        <a href="#">#unity3d</a>
                        <a href="#">#python</a>
                        <a href="#">#photosh</a>
                        <a href="#">#substance-painter</a>
                        <a href="#">#blender</a>
                        <a href="#">#animation</a>
                        <a href="#">#web-design</a>
                        <a href="#">#beginner</a>
                        <a href="#">#shadowhaven</a>
                        <a href="#">#tgom</a>
                    </div>
                </div>
                <div id="footer">
                    <div class="footer__cut-line"></div>
                    <div class="footer__content">
                        <div class="footer__content__copyright">
                            <p>© 2023 Aleksander Długosz</p>
                            <p>"Raiders roll"</p>
                        </div>
                        <div class="footer__content__socials">
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
    .post("/api/posts", async ({db, body}) => {
        const {title, content, createdAt} = body as any;
        await db.add({
            title: title,
            content: content,
            createdAt: new Date(createdAt)
        }).catch(console.error);
        return <PostList posts={await db.list()}/>;
    })
    .get("/styles.css", () =>
        new Response(stylesCompiled, {headers: {'Content-Type': 'text/css'}})
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

const PostItem = ({title, content, createdAt}: Post) => (
    <div class="post">
        <sub>{createdAt}</sub>
        <h1>{title}</h1>
        <p>{content}</p>
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
