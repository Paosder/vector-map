import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  sourcemap: true,
  outfile: 'dist/index.js',
  target: 'es2020',
  plugins: [],
  loader: {},
  external: [],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});