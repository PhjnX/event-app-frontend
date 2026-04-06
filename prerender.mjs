import puppeteer from "puppeteer";
import { createServer } from "node:http";
import handler from "serve-handler";
import fs from "node:fs";
import path from "node:path";

const DIST = "./dist";
const PORT = 3033;
const ROUTES = ["/", "/about", "/value", "/events", "/news"];

// Tạo server tạm để serve dist/
const server = createServer((req, res) =>
  handler(req, res, {
    public: DIST,
    rewrites: [{ source: "**", destination: "/index.html" }],
  }),
);

server.listen(PORT, async () => {
  console.log(`✅ Server tạm chạy tại http://localhost:${PORT}`);
  const browser = await puppeteer.launch();

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const html = await page.content();
    const filePath = path.join(
      DIST,
      route === "/" ? "index.html" : `${route}/index.html`,
    );

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html);
    console.log(`📄 Prerendered: ${route} → ${filePath}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log("🎉 Prerender xong!");
});
