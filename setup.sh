#!/bin/bash

PROJECT_OPTS=""
while (( "$#" )); do
   case "$1" in
      "flask")
         PROJECT_OPTS="$PROJECT_OPTS -D do_flask=enabled"
         ;;

      "gpl3")
         PROJECT_LICENSE="gpl3"
         ;;

      "lgpl3")
         PROJECT_LICENSE="lgpl3"
         ;;

      *)
         if [ -z "$PROJECT_NAME" ]; then
            PROJECT_NAME="$1"
         elif [ -z "$PROJECT_LANG" ]; then
            PROJECT_LANG="$1"
         else
            echo "Unsupported options: $1"
            exit 16
         fi
         ;;
   esac
   shift
done

if [ -z "$PROJECT_NAME" ]; then
   echo "Project name?"
   read PROJECT_NAME
   if [ -z "$PROJECT_NAME" ]; then
      exit 2
   fi
fi

if [ -z "$PROJECT_LANG" ]; then
   echo "Language? (c/python)"
   read PROJECT_LANG
   if [ -z "$PROJECT_LANG" ]; then
      exit 4
   fi
fi

PROJECT_UPPER=`echo "$PROJECT_NAME" | \
   tr '[a-z]' '[A-Z]'`

case $PROJECT_LANG in
   "c")
      TEMPLATE_FILES="
         src/Makefile
         src/template.c
         src/template.h
         tests/check.c
         tests/check_template.c"
      ;;
   
   "python")
      TEMPLATE_FILES="
         src/server.py
         "
      ;;

   *)
      echo "Invalid language specified."
      exit 8
      ;;
esac

if [ "$PROJECT_LICENSE" = "gpl3" ]; then
   wget "https://www.gnu.org/licenses/gpl-3.0.txt" -O LICENSE
elif [ "$PROJECT_LICENSE" = "lgpl3" ]; then
   wget "https://www.gnu.org/licenses/lgpl-3.0.txt" -O LICENSE
fi

# Loop through the files list and replace occurences of "template" with the
# project name in the file names and contents.
if [ -n "$PROJECT_NAME" ]; then
   for TEMPL_ITER in $TEMPLATE_FILES; do
      TEMPL_OUT="`sed "s/template/$PROJECT_NAME/g" <<< "$TEMPL_ITER"`"
      m4 \
         -D template="$PROJECT_NAME" \
         -D TEMPLATE="$PROJECT_UPPER" \
         $PROJECT_OPTS \
         $TEMPL_ITER.m4 > $TEMPL_OUT
   done
fi

#rm $0

