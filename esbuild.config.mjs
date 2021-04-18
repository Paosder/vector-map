import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  sourcemap: true,
  outfile: 'dist/esm/index.js',
  target: 'es2020',
  plugins: [],
  loader: {},
  external: [],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'cjs',
  target: 'es6',
  sourcemap: true,
  outfile: 'dist/cjs/index.js',
  plugins: [],
  loader: {},
  external: [],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
