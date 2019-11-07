#!/bin/bash

echo "Project name?"
read TEMPLATE_PROJECT_NAME

TEMPLATE_PROJECT_UPPER=`echo "$TEMPLATE_PROJECT_NAME" | \
   tr '[a-z]' '[A-Z]'`

TEMPLATE_FILES="
   src/Makefile
   src/template.c
   src/template.h
   tests/check.c
   tests/check_template.c"

# Loop through the files list and replace occurences of "template" with the
# project name in the file names and contents.
if [ -n "$TEMPLATE_PROJECT_NAME" ]; then
   for TEMPL_ITER in $TEMPLATE_FILES; do
      TEMPL_OUT="`sed "s/template/$TEMPLATE_PROJECT_NAME/g" <<< "$TEMPL_ITER"`"
      m4 \
         -D template="$TEMPLATE_PROJECT_NAME" \
         -D TEMPLATE="$TEMPLATE_PROJECT_UPPER" \
         $TEMPL_ITER.m4 > $TEMPL_OUT
   done
fi

rm $0

