---
tags:
  - tag1
---

# TITLE
# Example title

This is a test of having posts as markdown files.
Should work quite good.

```shell
$ echo "Example shell command"
```

```typescript
import { readdir } from 'node:fs/promises';  
import { join } from 'node:path';  
import { statSync } from "fs";  
import fm from "front-matter";  
import hljs from "highlight.js";  
  
const converter = require('markdown-it')({  
    linkify: true,  
    typographer: true,  
    highlight: (text: string, language: string) => {  
        if (!language || !hljs.getLanguage(language)) return '';  
        return '<pre class="hljs"><code>' +  
            hljs.highlight(text, { language: language, ignoreIllegals: true }).value +  
            '</code></pre>';  
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
  
function compareByCreatedAt(a: FileDescriptor, b: FileDescriptor) {  
    return a.createdAt.getMilliseconds() - b.createdAt.getMilliseconds();  
}  
  
const postsPerPage: number = 10;  
  
export class PostsDatabase {  
    private readonly dir: string;  
  
    constructor(directory: string) {  
        this.dir = directory;  
    }  
  
    async list(): Promise<Post[]> {  
        try {  
            let posts = (await readdir(this.dir))  
                .map((fileName) => {  
                    let path = join(this.dir, fileName);  
                    let stats = statSync(path);  
                    return {  
                        path: path,  
                        name: fileName,  
                        isDirectory: stats.isDirectory(),  
                        modifiedAt: stats.mtime,  
                        createdAt: stats.atime  
                    } as FileDescriptor;  
                })  
                .filter((fileDescriptor) => !fileDescriptor.isDirectory)  
                .sort(compareByCreatedAt)  
                .slice(0, postsPerPage)  
                .map(async (fileDescriptor) => {  
                    let fileText = await Bun.file(fileDescriptor.path).text();  
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
            return await Promise.all(posts);  
        } catch (e) {  
            console.log(e);  
            return [];  
        }  
    }  
}
```
## Html test 

<i>Html italic text test</i><br>
<b>Html bold text test</b>

<ul>
    <li>List 1</li>
    <li>List 2</li>
    <li>List 3</li>
</ul>