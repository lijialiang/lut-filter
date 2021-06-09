import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'
import babel from 'rollup-plugin-babel'

const TEST_DIR = '__test__'
const IS_TEST_ENV = process.env.NODE_ENV === 'test'
const DIST_FILE_NAME = 'webgl-lut-filter.js'

export default {
  input: 'src/main.js',
  output: {
    file: IS_TEST_ENV ? `${TEST_DIR}/${DIST_FILE_NAME}` : DIST_FILE_NAME,
    format: 'umd',
    name: 'lutFilter',
    sourcemap: !!IS_TEST_ENV
  },
  plugins: [
    babel({
      babelrc: false,
		  presets: [['@babel/env', { modules: false }]],
    }),
    IS_TEST_ENV && serve(TEST_DIR),
    IS_TEST_ENV && livereload({
      delay: 500,
      watch: TEST_DIR,
      verbose: false,
    }),
    !IS_TEST_ENV && terser(),
    !IS_TEST_ENV && banner('v<%= pkg.version %>')
  ]
}
