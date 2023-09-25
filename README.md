# My personal website

## Goals

1. Lightweight: The less dependencies, the better
2. Performant: Should run easily on minimal hardware and support plenty of connections
3. Minimal: Leverage existing solutions

## Post storage

Posts are stored as markdown files in this repository.

This allows me to leverage a plethora of existing text editors to write my posts,
and also avoid setting up an admin panel and an authentication system.
Additionally, i get a versioning system for free - git!

## Markdown library decision

At the time of taking a decision (Mon 25th of Sep 2023), these were the stats of the most popular markdown libraries:

|                                | markdown-it          | marked                                                         | remarkable           | showdown           |
|--------------------------------|----------------------|----------------------------------------------------------------|----------------------|--------------------|
| stars                          | 16,034               | 30,510                                                         | 5,573                | 13,520             |         
| issues                         | 51                   | 18                                                             | 132                  | 188                |
| updated                        | a year ago           | 7 days ago                                                     | a year ago           | a year ago         |
| created                        | 9 years ago          | 12 years ago                                                   | 9 years ago          | 12 years ago       |
| ***Features***                 |                      |                                                                |                      |                    |
| CommonMark                     | ✅                    | [Partial](https://github.com/markedjs/marked/discussions/1202) | ✅                    | ✅                  |
| Speed                          | 2,834 ops/sec ±0.57% | 2,230 ops/sec ±0.67%                                           | 4,307 ops/sec ±0.53% | 505 ops/sec ±0.40% |
| Metadata header / Front matter | 🚫                     |    🚫                                                            |    🚫                  | ✅                  |

Things that I prioritized, in descending order of importance:

1. Features
2. Support
3. Speed

Things that I did not care about, since this will be running on the backend:

- Browser support
- Bundle size

### Winner: markdown-it!

Showdown has been discarded due to slow performance and having the most amount of issues.
Remarkable has been discarded due to toxic community, bad support, and issue count.
Marked has been discarded mainly due to partial support of common mark, but also slower performance.

Markdown-it has more issues than marked, but when I reviewed markdown-it's issues, they were just questions from newbies, not actual bugs.

The library also focuses on security, and although I will be the only person writing the posts, it's a nice additional layer of security for my website in case anyone would tamper with the linked media.

With no apparent bugs, satisfying performance, and a good community providing many plugins, markdown-it is the best choice for server-side markdown parsing at the moment of writing.

### Sources
Npm stats: https://npmtrends.com/markdown-it-vs-marked-vs-remarkable-vs-showdown \
Benchmarking: https://www.measurethat.net/Benchmarks/Show/8434/0/markdown-performance-comparison

## TODO

- [ ] Add post caching system
- [ ] Style posts
- [ ] Add a way to read tags from posts
- [ ] Add post reactions

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.