#!/bin/bash

PROJECT_DIR="$(dirname $0)"
PROJECT_OPTS=""
LICENSE_PATH="$PROJECT_DIR/LICENSE"
DO_FLASK=0
DO_BOOTSTRAP=0
DO_JQUERY=0
DO_NPM=0
DO_CLEAN=0
while (( "$#" )); do
   case "$1" in
      "flask")
         DO_FLASK=1
         ;;

      "bootstrap")
         DO_BOOTSTRAP=1
         ;;

      "jquery")
         DO_JQUERY=1
         ;;

      "gpl3")
         PROJECT_LICENSE="gpl3"
         ;;

      "lgpl3")
         PROJECT_LICENSE="lgpl3"
         ;;

      "clean")
         DO_CLEAN=1
         ;;

      *)
         if [ -z "$PROJECT_NAME" ]; then
            PROJECT_NAME="$1"
         else
            echo "Unsupported options: $1"
            exit 16
         fi
         ;;
   esac
   shift
done

if [ $DO_BOOTSTRAP = 1 ]; then
   PROJECT_OPTS="$PROJECT_OPTS -D do_bootstrap=enabled"
   DO_FLASK=1
   DO_NPM=1
fi

if [ $DO_JQUERY = 1 ]; then
   PROJECT_OPTS="$PROJECT_OPTS -D do_jquery=enabled"
   DO_FLASK=1
   DO_NPM=1
fi

if [ $DO_FLASK = 1 ]; then
   PROJECT_OPTS="$PROJECT_OPTS -D do_flask=enabled"
fi

if [ $DO_NPM = 1 ]; then
   PROJECT_OPTS="$PROJECT_OPTS -D do_npm=enabled"
fi

echo "$PROJECT_DIR"

if [ -z "$PROJECT_NAME" ]; then
   echo "Project name?"
   read PROJECT_NAME
   if [ -z "$PROJECT_NAME" ]; then
      exit 2
   fi
fi

if [ -z "$PROJECT_LICENSE" ]; then
   echo "License? (gpl3/lgpl3)"
   read PROJECT_LICENSE
   if [ -z "$PROJECT_LICENSE" ]; then
      exit 32
   fi
fi

PROJECT_UPPER=`echo "$PROJECT_NAME" | \
   tr '[a-z]' '[A-Z]'`

TEMPLATE_FILES="
   src/server.py
   "

if [ $DO_FLASK = 1 ]; then
   TEMPLATE_FILES="$TEMPLATE_FILES Dockerfile requirements.txt"
fi

if [ $DO_NPM = 1 ]; then
   TEMPLATE_FILES="$TEMPLATE_FILES Gruntfile.js package.json"
fi

if [ "$PROJECT_LICENSE" = "gpl3" ]; then
   wget "https://www.gnu.org/licenses/gpl-3.0.txt" -O "$LICENSE_PATH"
elif [ "$PROJECT_LICENSE" = "lgpl3" ]; then
   wget "https://www.gnu.org/licenses/lgpl-3.0.txt" -O "$LICENSE_PATH"
fi

# Loop through the files list and replace occurences of "template" with the
# project name in the file names and contents.
if [ -n "$PROJECT_NAME" ]; then
   for TEMPL_ITER in $TEMPLATE_FILES; do
      TEMPL_OUT="`sed "s/template/$PROJECT_NAME/g" \
         <<< "$PROJECT_DIR/$TEMPL_ITER"`"
      m4 \
         -D template="$PROJECT_NAME" \
         -D TEMPLATE="$PROJECT_UPPER" \
         $PROJECT_OPTS \
         "$PROJECT_DIR/$TEMPL_ITER.m4" > "$PROJECT_DIR/$TEMPL_OUT"
   done
fi

if [ $DO_CLEAN = 1 ]; then
   rm -rf "$PROJECT_DIR/.git"
   find "$PROJECT_DIR" -name "*.m4" -exec rm {} \;
   git init "$PROJECT_DIR"
   git add $TEMPLATE_FILES .gitignore LICENSE src/static src/templates
   git commit -a -m "Initial revision based on template."
   rm "$0"
fi

#rm $0

