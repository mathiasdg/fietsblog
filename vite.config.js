// vite.config.js
// import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

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
  plugins: [
      // lightboxHrefPlugin(), // Add our custom plugin
      // ViteImageOptimizer({
      //   dir: "processed",
      //   webp: {
      //     quality: 80,
      //     progressive: true,
      //   },
      //   jpg: {
      //     quality: 80,
      //     progressive: true,
      //   },
      // }),
   ] 
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
