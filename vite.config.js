// vite.config.js
// import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
  base: './',
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  },
  server: {
    open: true,
  },
  // plugins: [
  //   basicSsl({
  //     /** name of certification */
  //     name: "test",
  //     /** custom trust domains */
  //     domains: ["*.custom.com"],
  //     /** custom certification directory */
  //     certDir: "/Users/.../.devServer/cert",
  //   }),
  // ],
});
