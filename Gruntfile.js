
module.exports = function( grunt ) {

   var env = grunt.option( 'env' ) || 'std';
   var static_dir = 'src/static/';

   if( 'docker' == env ) {
      static_dir = 'app/static/';
   }

   grunt.initConfig( {
      copy: {
         main: {
            files: [
               {expand: true, src: [
                  'node_modules/jquery/dist/jquery.min.js',
                  
               ],
               dest: static_dir, flatten: true},
            ]
         }
      }
   } )

   grunt.loadNpmTasks( 'grunt-contrib-copy' );

   grunt.registerTask( 'default', ['copy'] );
};

