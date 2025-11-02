// v10.1 - Force complete cache reset to fix React duplication
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  cacheDir: ".vite-cache-v10.1",
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
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    force: true,
    include: ["react", "react-dom", "react/jsx-runtime"],
    exclude: [],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
