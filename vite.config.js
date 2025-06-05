// vite.config.js
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  build: {
    target: "esnext",
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/localhost-cert.pem")),
    },
    // https: {
    //   key: "./localhost-key.pem",
    //   cert: "./localhost-cert.pem",
    // },
    // host: "localhost", // Ensure it’s accessible on localhost
    // port: 5173,
    // open: true,
  },
});
