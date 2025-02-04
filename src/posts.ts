import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from "fs";
import fm from "front-matter";
import hljs from "highlight.js";
import * as fs from "fs";

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
            '<div class="hljs-scroll-container"><pre class="hljs"><code>' +
            hljs.highlight(text, {language: languageRaw, ignoreIllegals: true}).value +
            '</code></pre></div>' +
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

    async list(tag: string | undefined): Promise<Post[]> {
        try {
            let postsPromise = (await readdir(this.dir))
                .map((fileName) => {
                    let path = join(this.dir, fileName);
                    let stats = statSync(path);
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
                .map((fileDescriptor) => {
                    // https://github.com/oven-sh/bun/issues/5960
                    // let fileText = await Bun.file(fileDescriptor.path).text();
                    // The above will trigger a segfault. Try/catch won't work, nothing will.
                    // Replace with bBun's implementation once the issue is fixed.
                    const fileText = fs.readFileSync(fileDescriptor.path, { encoding: 'utf8', flag: 'r' });
                    let frontMatter = fm<PostAttributes>(fileText);
                    let metadata = frontMatter.attributes;
                    let content = frontMatter.body;
                    let contentHtml = converter.render(content);
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
                posts = posts.filter((post) => post.tags.includes(tag));
            }
            return posts;
        } catch (e) {
            console.log(e);
            return [];
        }
    }
}
