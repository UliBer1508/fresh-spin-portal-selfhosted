// v9.0 - Remove custom cache, use default
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    force: true,
    include: ["react", "react-dom"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
