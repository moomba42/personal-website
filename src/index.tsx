import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";

const app = new Elysia()
    .use(html())
    .get("/", ({html}) => html(
        <BaseHtml>
            <h2>Moomba's Seaside Port</h2>
            <button hx-post="/clicked" hx-swap="outerHTML">Click Me</button>
            <TestComponent>
                <li>List item 1</li>
                <li>List item 3</li>
                <li>List item 4</li>
            </TestComponent>
        </BaseHtml>
    ))
    .post("/clicked", ({html}) => html(<div>Some div</div>))
    .listen(3000);

const BaseHtml = ({children}: elements.Children) => "<!DOCTYPE html>" + (
    <html lang="en">
    <head>
        <title>Moomba's Seaside Port</title>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </head>
    <body>
        {children}
    </body>
    </html>
);

const TestComponent = ({children}: elements.Children) => (
    <div>
        <p>Here is a list:</p>
        <ul>
            {children}
        </ul>
    </div>
);

