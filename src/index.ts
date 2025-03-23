import { Hono } from "hono";
import { cache } from "hono/cache";

const app = new Hono();

app.use(
  "*",
  cache({
    cacheName: "github-md-cache",
    cacheControl: "max-age=86400, s-maxage=86400", // 1Day
  }),
);

const owner = "kamranahmedse";
const repo = "developer-roadmap";

app.get("/list", async (c) => {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/src/data/roadmaps`;

    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Hono-Workers-GitHub-Fetcher",
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return c.json(
        {
          error: "Failed to fetch data from GitHub",
          status: response.status,
          message: await response.text(),
        },
        response.status as any,
      );
    }

    interface GithubContent {
      name: string;
      path: string;
      type: string;
      html_url: string;
    }

    const contents = (await response.json()) as GithubContent[];

    const folders = contents
      .filter((item) => item.type === "dir")
      .map((folder) => folder.name);
    return c.json(folders);
  } catch (error) {
    console.error("Error:", error);
    return c.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

app.get("/content", async (c) => {
  const name = c.req.query("name");

  if (!name) {
    return c.json(
      {
        error: "Name is required",
        message:
          "Please provide a name to fetch the content. You can get the name from /list endpoint",
      },
      400,
    );
  }

  try {
    const directoryContentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/src/data/roadmaps/${name}/content`;

    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Hono-Workers-GitHub-Fetcher",
    };

    const response = await fetch(directoryContentsUrl, { headers });

    if (!response.ok) {
      return c.json(
        {
          error: "Failed to fetch data from GitHub",
          status: response.status,
          message: await response.text(),
        },
        response.status as any,
      );
    }

    const contents = await response.json();
    let mdFiles: any[] = [];

    if (Array.isArray(contents)) {
      mdFiles = contents.filter(
        (item) => item.type === "file" && item.name.endsWith(".md"),
      );

      const mdContents = await Promise.all(
        mdFiles.map(async (file) => {
          const fileResponse = await fetch(file.download_url, { headers });
          if (fileResponse.ok) {
            const content = await fileResponse.text();
            return {
              name: file.name,
              content,
            };
          }
          return {
            name: file.name,
            path: file.path,
            error: "Failed to fetch file content",
            download_url: file.download_url,
          };
        }),
      );

      return c.json({
        name: name,
        contents: mdContents,
      });
    }
    return c.json({
      error: "The specified path is not a directory",
      item: contents,
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

app.get("/", (c) => {
  return c.json({
    message: "Welcome to roadmapsh-txt",
  });
});

export default app;
