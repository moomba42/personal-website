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

interface FileDescriptor {
    name: string;
    path: string;
    isDirectory: boolean;
}

export interface PostAttributes {
    tags?: string[];
}

export interface Post {
    name: string;
    tags: string[];
    publishedAt: Date;
    contentMd: string;
    contentHtml: string;
}

const postsPerPage: number = 10;

export class PostsDatabase {
    private readonly dir: string;
    private posts: Post[] = [];
    private tags: string[] = [];

    public constructor(directory: string) {
        this.dir = directory;
        this.init().then();
    }

    private async init() {
        try {
            this.posts = (await readdir(this.dir))
                .map((fileName) => {
                    let path = join(this.dir, fileName);
                    let stats = statSync(path);
                    return {
                        path: path,
                        name: fileName,
                        isDirectory: stats.isDirectory(),
                    } as FileDescriptor;
                })
                .filter((fileDescriptor) => !fileDescriptor.isDirectory)
                .sort((a, b) => b.name.localeCompare(a.name))
                .map((fileDescriptor) => {
                    // https://github.com/oven-sh/bun/issues/5960
                    // let fileText = await Bun.file(fileDescriptor.path).text();
                    // The above will trigger a segfault. Try/catch won't work, nothing will.
                    // Replace with bBun's implementation once the issue is fixed.
                    const fileText = fs.readFileSync(fileDescriptor.path, { encoding: 'utf8', flag: 'r' });
                    const frontMatter = fm<PostAttributes>(fileText);
                    const metadata = frontMatter.attributes;
                    const content = frontMatter.body;
                    const contentHtml = converter.render(content);

                    const publishedAt = this.parsePublishDateFromFilename(fileDescriptor.name) ?? new Date(Date.now() + 100_000);

                    return {
                        name: fileDescriptor.name,
                        tags: metadata?.tags ?? [],
                        publishedAt: publishedAt,
                        contentMd: content,
                        contentHtml: contentHtml,
                    } as Post;
                });
            console.log("Loaded "+this.posts.length+" posts");
        } catch(error) {
            console.log("Couldn't load posts");
            console.log(error);
        }

        this.tags = [...new Set(this.posts.flatMap((post) => post.tags))];
        console.log("Loaded "+this.tags.length+" tags");
    }

    private parsePublishDateFromFilename(filename: string): Date | null {
        if(filename.length < 10) {
            return null;
        }

        const publishedAtYear = parseInt(filename.slice(0, 4));
        const publishedAtMonth = parseInt(filename.slice(5, 7));
        const publishedAtDay = parseInt(filename.slice(8, 10));

        return new Date(Date.UTC(publishedAtYear, publishedAtMonth, publishedAtDay, 12, 0, 0, 0));
    }

    public async listPublished(tag: string | undefined): Promise<Post[]> {
        if (tag && tag !== "undefined") {
            return this.posts.filter((post) => post.tags.includes(tag) && post.publishedAt.getTime() < Date.now()).slice(0, postsPerPage);
        }
        return this.posts.filter((post) => post.publishedAt.getTime() < Date.now()).slice(0, postsPerPage);
    }

    public async listTags(): Promise<string[]> {
        return this.tags;
    }
}
