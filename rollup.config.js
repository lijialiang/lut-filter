import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'
import typescript from 'rollup-plugin-typescript2'
import { babel } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const TEST_DIR = '__test__'
const IS_TEST_ENV = process.env.NODE_ENV === 'test'

const plugins = [
  resolve({ jsnext: true, preferBuiltins: true, browser: true }),
  commonjs(),
  typescript({
    tsconfig: IS_TEST_ENV ? 'tsconfig.test.json' : 'tsconfig.json'
  }),
  babel({
    exclude: /node_modules/,
    babelrc: false,
    babelHelpers: 'runtime',
    presets: [
      '@babel/preset-env'
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        { targets: '> 0.25%, not dead' }
      ]
    ]
  }),
  IS_TEST_ENV && serve(TEST_DIR),
  IS_TEST_ENV && livereload({
    watch: TEST_DIR,
    verbose: false
  }),
  !IS_TEST_ENV && terser({
    output: {
      comments: false
    }
  }),
  !IS_TEST_ENV && banner('<%= pkg.homepage %> v<%= pkg.version %>')
]

export default [
  {
    input: 'src/webgl.ts',
    output: {
      file: IS_TEST_ENV ? `${TEST_DIR}/webgl.js` : 'webgl.js',
      format: 'umd',
      name: 'lutFilter',
      sourcemap: !!IS_TEST_ENV
    },
    plugins
  },
  {
    input: 'src/webgpu.ts',
    output: {
      file: IS_TEST_ENV ? `${TEST_DIR}/webgpu.js` : 'webgpu.js',
      format: 'umd',
      name: 'lutFilter',
      sourcemap: !!IS_TEST_ENV
    },
    plugins
  }
]
