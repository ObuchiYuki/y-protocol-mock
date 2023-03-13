import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [{
  input: './src/test.js',
  output: {
    file: './dist/test.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    resolve({ mainFields: ['module', 'browser', 'main'] }),
    commonjs()
  ]
}, {
  input: [
    './src/index.js'
  ],
  output: {
    dir: './dist',
    format: 'cjs',
    sourcemap: true,
    entryFileNames: '[name].cjs',
    chunkFileNames: '[name]-[hash].cjs',
    paths: /** @param {any} path */ path => {
      if (/^lib0\//.test(path)) {
        return `lib0/dist/${path.slice(5) + '.cjs'}`
      }
      return path
    }
  },
  external: /** @param  {any} id */ id => /^lib0\/|yjs/.test(id)
}]
