FROM oven/bun
WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.tsx" ]