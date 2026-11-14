# Gal Goldman | Architect & Engineer

Source for [gel.github.io](https://gel.github.io/), my personal site covering distributed systems, cloud architecture, production AI, and engineering quality.

Built with Zola, Markdown, Tera templates, Sass, and JavaScript. Hosted on GitHub Pages.

## Site content

- **[Blog](https://gel.github.io/blog/)** — technical articles and engineering experience.
- **[Projects](https://gel.github.io/projects/)** — selected projects, tools, and workshops.
- **[Generative AI](https://gel.github.io/generative-ai/)** — agentic development tools, workflows, and research notes.
- **[Interviews](https://gel.github.io/interviews/)** — interview preparation, coding problems, system design, and an [interactive coding playground](https://gel.github.io/interviews/live/).
- **[Books](https://gel.github.io/books/)** and **[Podcasts](https://gel.github.io/podcasts/)** — reading and listening notes.
- **[Resume](https://gel.github.io/resume/)** — professional background and experience.

## Run locally

Install [Zola](https://www.getzola.org/documentation/getting-started/installation/) (the deployment workflow uses **0.17.2**).

From the repository root:

```sh
zola serve
```

Open <http://127.0.0.1:1111/>. Changes reload automatically; stop with `Ctrl+C`.

## Build and publish

Build the production site:

```sh
zola build
```

Output goes to `public/` (ignored by Git). The [GitHub Actions workflow](.github/workflows/main.yml) builds and publishes to the `gh-pages` branch on pushes to `main`.
