/*if (process.env.NODE_ENV === 'production') {

  module.exports = {
    indexPath: '../resources/views/index.php',
    outputDir: '../public',

    lintOnSave: false,
    runtimeCompiler:true,
  }

} else*/
 {

  module.exports = {

    devServer: {
      proxy: process.env.VUE_APP_PROXY,
    },

    indexPath: '../resources/views/index.php',
    outputDir: '../public',

    lintOnSave: false,
    runtimeCompiler:true,
  }


}


