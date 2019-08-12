import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'

const testEnv = process.env.NODE_ENV === 'test'

export default {
  input: 'src/main.js',
  output: {
    file: testEnv ? 'test/main.js' : 'webgl-lut-filter.js',
    format: 'umd',
    name: 'lutFilter',
    sourcemap: !!testEnv
  },
  plugins: [
    testEnv && serve('test'),
    testEnv && livereload({
      delay: 500,
      watch: 'test',
      verbose: false,
    }),
    !testEnv && terser(),
    !testEnv && banner('v<%= pkg.version %>')
  ]
}
