import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    {
      name: 'eta-raw-loader',
      transform(code, id) {
        if (id.endsWith('.eta')) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    },
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    {
      name: 'copy-styles',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'src/styles.css'),
          resolve(__dirname, 'dist/styles.css')
        );
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LegendStateDevTools',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.js'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'eta',
        'json-edit-react',
        '@legendapp/state',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOMClient',
          eta: 'Eta',
          'json-edit-react': 'JsonEditReact',
          '@legendapp/state': 'LegendState',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.eta'],
  },
});
