import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Mobile-first optimizations
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],

    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for node_modules
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-charts": ["recharts"],
          "vendor-utils": ["socket.io-client", "react-confetti"],
        },
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "images";
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            extType = "fonts";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
    },

    // Optimize chunk size for mobile
    chunkSizeWarningLimit: 500,

    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production", // Remove console in production
        drop_debugger: true,
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps disabled for production
    sourcemap: false,

    // Reduce bundle size
    reportCompressedSize: true,
  },

  // Performance optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
    // Exclude heavy dependencies from pre-bundling
    exclude: ["@splinetool/react-spline"],
  },

  // Development server settings
  server: {
    // Enable HTTP/2 for faster loading
    hmr: {
      overlay: true,
    },
    // Compression for dev server
    compress: true,
  },

  // Preview server settings (for production preview)
  preview: {
    port: 3000,
    strictPort: true,
    compress: true,
  },
}));
