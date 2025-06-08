// vite.config.js
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: './', // This ensures assets are loaded with relative paths
  build: {
    target: "esnext",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
  },
  publicDir: "public",
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-cert.pem")),
    },
    // https: {
    //   key: "./localhost-key.pem",
    //   cert: "./localhost-cert.pem",
    // },
    // host: "localhost", // Ensure it's accessible on localhost
    // port: 5173,
    // open: true,
  },
});
