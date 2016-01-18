#!/bin/bash
#===============================================
# generate thumbnail images for tagspaces
#
# TODO
# * Handle dirs with spaces in the names
# * Don't create .ts in .ts folders 
#===============================================

generate_thumbnails() {
	dirname=$1
	thumbdir=$dirname/.ts
  echo "-------Current dir: $dirname"
	mkdir -p $thumbdir

	for file in $1/*
	do
	  # next line checks the mime-type of the file
	  CHECKTYPE=`file --mime-type -b "$file" | awk -F'/' '{print $1}'`
	  if [ "x$CHECKTYPE" == "ximage" ]; 
    then
	    CHECKSIZE=`stat -f "%z" "$file"`               # this returns the filesize
	    CHECKWIDTH=`identify -format "%W" "$file"`     # this returns the image width

	    # next 'if' is true if either filesize >= 200000 bytes  OR  if image width >=201
	    if [ $CHECKSIZE -ge  200 ] || [ $CHECKWIDTH -ge 201 ]; then
	    	echo "$file -> $thumbdir/$(basename $file).png" 
	    	convert -thumbnail 200 $file $thumbdir/$(basename $file).png
	    fi
	  fi
	done
}

if [ $# -ne 1 ]; then
  echo "Usage $0 <path>"	
  exit 2             		
fi

find $1 -type d | while read dir
do
  generate_thumbnails $dir
done
