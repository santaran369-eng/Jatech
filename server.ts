import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import archiver from "archiver";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API to download the full project as a ZIP
  app.get("/api/download-project", (req, res) => {
    const projectPath = process.cwd();
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=tech-janat-project.zip");

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("Zip error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);
    
    // Add files and directories, excluding node_modules and dist
    archive.glob("**/*", {
      cwd: projectPath,
      ignore: [
        "node_modules/**",
        "dist/**",
        ".git/**",
        "package-lock.json",
        "*.zip"
      ],
      dot: true
    });

    archive.finalize();
  });

  // API to download individual files
  app.get("/api/download-file", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).send("Path is required");

    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).send("File not found");

    res.download(fullPath);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
