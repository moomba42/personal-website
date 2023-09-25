import { readdir } from "node:fs/promises";
import { closeSync, openSync, readSync } from "fs";
import { PostAttributes } from "./posts";
import { join } from "node:path";
import { parse } from "yaml";

const readPostTags = function (path: string) {
    console.log("Reading post tags", path);
    return new Promise<string[]>((resolve, reject) => {
        // Open the file
        let chunkSize = 1024; // 1 KB
        let fd = openSync(path, 'r');

        // Look for start sequence
        let startSequence = '---\n';
        let startLength = startSequence.length;
        let startBuffer = Buffer.from(new Uint8Array(startLength));
        readSync(fd, startBuffer, 0, startLength, 0);
        if (startBuffer.toString('utf8') !== startSequence) {
            console.log("\t- No metadata found ⚠️");
            closeSync(fd);
            resolve([]);
            return;
        }

        let endSequence = '\n---\n';
        let position = startBuffer.length; // Start after the start sequence
        let chunks = [];

        // Look for end sequence
        let buffer = Buffer.from(new Uint8Array(chunkSize));
        let bytesRead = 0;
        let valid = false; // If we have found the end sequence
        let endSequenceCursor = 0; // Keep track of the successful char matches
        while ((bytesRead = readSync(fd, buffer, 0, chunkSize, position)) >= chunkSize) {
            // Read next chunk
            let chunk = buffer.subarray(0, bytesRead);
            position += chunk.length;

            // Find end sequence
            let endSequenceStartIndex = -1;
            for (let i = 0; i < chunk.length; i++) {
                let character = chunk[i];
                let endSequenceCharacter = endSequence.charCodeAt(endSequenceCursor);
                if (character === endSequenceCharacter) {
                    endSequenceCursor++;
                    if (endSequenceCursor == endSequence.length) {
                        endSequenceStartIndex = i - endSequence.length + 1;
                        break;
                    }
                } else {
                    endSequenceCursor = 0;
                }
            }

            // If end sequence found, crop the current chunk and break
            if (endSequenceStartIndex >= 0) {
                let finalChunk = chunk.subarray(0, endSequenceStartIndex);
                chunks.push(finalChunk);
                valid = true;
                break;
            }

            chunks.push(chunk);
        }

        // Parse metadata if present
        if (valid) {
            console.log("\t- Found metadata");
            let rawMetadataYaml = Buffer.concat(chunks).toString('utf8');
            let metadata = parse(rawMetadataYaml) as PostAttributes;
            let tags = metadata.tags;
            if (tags && tags.length > 0) {
                console.log(`\t- Found ${tags.length} tags`);
            } else {
                console.log("\t- No tags found");
            }
            resolve(metadata.tags ?? []);
        } else {
            console.log("\t- No metadata found, but starts like metadata ⚠️");
            resolve([]);
        }

        closeSync(fd);
    });
}

export class TagsDatabase {
    private readonly dir: string;

    constructor(directory: string) {
        this.dir = directory;
    }

    async list(): Promise<string[]> {
        try {
            let directoryEntries = await readdir(this.dir, {withFileTypes: true});
            let files = directoryEntries.filter((entry) => entry.isFile()).map((file) => file.name);
            console.log("Found the following files in posts directory: ", files);
            let allTags: string[] = [];
            for (let fileName of files) {
                let path = join(this.dir, fileName);
                allTags.push(...(await readPostTags(path)));
            }
            return [...new Set<string>(allTags)];
        } catch (e) {
            console.log(e);
            return [];
        }
    }
}