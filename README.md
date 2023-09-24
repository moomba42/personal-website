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