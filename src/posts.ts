import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from "fs";
import fm from "front-matter";
import hljs from "highlight.js";
import { file } from "bun";

const converter = require('markdown-it')({
    linkify: true,
    typographer: true,
    highlight: (text: string, languageRaw: string) => {
        if (!languageRaw) return '';
        let language = hljs.getLanguage(languageRaw);
        if (!language) return '';
        return '<div class="hljs-container">' +
            '<div class="hljs-fade"></div>' +
            '<div class="hljs-language">' + language.name + '</div>' +
            '<pre class="hljs"><code>' +
            hljs.highlight(text, {language: languageRaw, ignoreIllegals: true}).value +
            '</code></pre>' +
            '<div class="hljs-scroll-text">SCROLL</div>' +
            '</div>';
    }
})
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'))
    .use(require('markdown-it-mark'))
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-checkbox'));

export interface Post {
    id: string;
    tags: string[];
    contentMd: string;
    contentHtml: string;
    modifiedAt: Date;
    createdAt: Date;
}

export interface PostAttributes {
    tags?: string[];
}

interface FileDescriptor {
    path: string;
    name: string;
    isDirectory: boolean;
    modifiedAt: Date;
    createdAt: Date;
}

function compareByCreatedAtDesc(a: FileDescriptor, b: FileDescriptor) {
    return b.createdAt.getTime() - a.createdAt.getTime();
}

const postsPerPage: number = 10;

export class PostsDatabase {
    private readonly dir: string;

    constructor(directory: string) {
        this.dir = directory;
    }

    async list(tag: string | null): Promise<Post[]> {
        console.log("Reading posts by tag ", tag)
        try {
            let postsPromise = (await readdir(this.dir))
                .map((fileName) => {
                    console.log(`Getting full path for filename ${fileName}`);
                    let path = join(this.dir, fileName);
                    console.log(`Got full path: ${path}. Getting stats.`);
                    let stats = statSync(path);
                    console.log(`Got stats: `, stats);
                    return {
                        path: path,
                        name: fileName,
                        isDirectory: stats.isDirectory(),
                        modifiedAt: stats.mtime,
                        createdAt: stats.ctime
                    } as FileDescriptor;
                })
                .filter((fileDescriptor) => !fileDescriptor.isDirectory)
                .sort(compareByCreatedAtDesc)
                .slice(0, postsPerPage)
                .map(async (fileDescriptor) => {
                    console.log(`Reading as bun file `);
                    let fileText = await Bun.file(fileDescriptor.path).text();
                    console.log(`Parsing front matter`);
                    let frontMatter = fm<PostAttributes>(fileText);
                    console.log(`Getting metadata from frontmatter`);
                    let metadata = frontMatter.attributes;
                    let content = frontMatter.body;
                    console.log(`Rendering html`);
                    let contentHtml = converter.render(content);
                    console.log(`Returning post`);
                    return {
                        id: fileDescriptor.name,
                        tags: metadata?.tags ?? [],
                        contentMd: content,
                        contentHtml: contentHtml,
                        modifiedAt: fileDescriptor.modifiedAt,
                        createdAt: fileDescriptor.createdAt
                    } as Post;
                });
            let posts = await Promise.all(postsPromise);
            if (tag && tag !== "undefined") {
                console.log("Filtering by tag", tag);
                console.log("Tag type", typeof tag);
                posts = posts.filter((post) => post.tags.includes(tag));
            }
            console.log(`Returning posts`);
            return posts;
        } catch (e) {
            console.log(e);
            return [];
        }
    }
}