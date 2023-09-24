import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { statSync } from "fs";

export interface Post {
    id: string;
    tags: string[];
    content: string;
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

export class PostsDatabase {
    private readonly dir: string;

    constructor(directory: string) {
        this.dir = directory;
    }

    async list(): Promise<Post[]> {
        try {
            let files = await readdir(this.dir);
            let fileDescriptors: FileDescriptor[] = files.map((fileName) => {
                let path = join(this.dir, fileName);
                let stats = statSync(path);
                return {
                    path: path,
                    name: fileName,
                    isDirectory: stats.isDirectory(),
                    modifiedAt: stats.mtime,
                    createdAt: stats.atime
                };
            }).filter((fileDescriptor) => !fileDescriptor.isDirectory);
            let count = Math.min(10, fileDescriptors.length);
            let wantedFiles = fileDescriptors.sort(compareByCreatedAt).slice(0, count);
            let posts = wantedFiles.map(async (fileDescriptor) => {
                let content = await Bun.file(fileDescriptor.path).text();
                return {
                    id: fileDescriptor.name,
                    tags: [],
                    content: content,
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