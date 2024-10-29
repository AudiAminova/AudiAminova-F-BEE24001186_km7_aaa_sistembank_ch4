// konfigurasi babel
export default {
    presets: [
      ['@babel/preset-env', {
        modules: false,
      }],
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs', // transformasi modul ESM ke CommonJS
    ],
  };
  