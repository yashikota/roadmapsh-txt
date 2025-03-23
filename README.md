# roadmapsh-txt

A simple API to fetch roadmap content from the [developer-roadmap](https://github.com/kamranahmedse/developer-roadmap) repository.

## Live Demo

The API is deployed at: [https://roadmapsh-txt.yashikota.workers.dev](https://roadmapsh-txt.yashikota.workers.dev)

## Features

- List all available roadmaps
- Fetch detailed Markdown content for specific roadmaps

## API Endpoints

### List Available Roadmaps

<https://roadmapsh-txt.yashikota.workers.dev/list>

Returns an array of all available roadmap names.

### Fetch Roadmap Content

<https://roadmapsh-txt.yashikota.workers.dev/content?name=full-stack>

Returns the Markdown content for a specific roadmap.

Query parameters:

- `name`: Name of the roadmap (required)

## Local Development

1. Install [Bun](https://bun.dev)
2. `bun i`
3. `bun run dev`
