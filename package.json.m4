dnl
divert(-1)
changequote(`[', `]')
define([jquery_deps], ["jquery": "^3.4.1",
])
define([bootstrap_deps], ["bootstrap": "^4.3.1",
      "popper.js": "1.14.7"
])
changequote([`], ['])
divert(0)
dnl
{
   "name": "template",
   "version": "0.0.0",
   "description": "template",
   "dependencies": {
      ifelse(do_jquery, `enabled', `jquery_deps', `')
      ifelse(do_bootstrap, `enabled', `bootstrap_deps', `')
   },
   "devDependencies": {
      "grunt": "^0.4.5",
      "grunt-contrib-uglify": "^0.11.0",
      "grunt-contrib-cssmin": "^0.14.0",
      "grunt-contrib-concat": "^0.5.1",
      "grunt-contrib-copy": "^1.0.0"
   }
}
