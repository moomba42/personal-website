import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from "fs";
import showdown from 'showdown';
import yaml from 'yaml';

const converter = new showdown.Converter({
    strikethrough: true,
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    tables: true,
    ghCodeBlocks: true,
    tasklists: true,
    openLinksInNewWindow: true,
    metadata: true
});

export interface Post {
    id: string;
    tags: string[];
    contentMd: string;
    contentHtml: string;
    modifiedAt: Date;
    createdAt: Date;
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
                    let content = await Bun.file(fileDescriptor.path).text();
                    let contentHtml = converter.makeHtml(content);
                    let metadataYaml: string = converter.getMetadata(true).toString() ?? "";
                    let metadata = yaml.parse(metadataYaml);
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