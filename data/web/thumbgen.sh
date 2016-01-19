#!/bin/bash
#===============================================
# generate thumbnail images for tagspaces
#===============================================

generate_thumbnails() {
    dirname="$1"
    thumbdir="$dirname/.ts"
    echo "Current dir: $dirname"
    mkdir -p "$thumbdir"

    for file in "$dirname/"*
    #find "$dirname" -type f -maxdepth 1 | while read file
    do
      # next line checks the mime-type of the file
      CHECKTYPE=`file --mime-type -b "$file" | awk -F'/' '{print $1}'`
      if [ "x$CHECKTYPE" == "ximage" ]; 
    then
        CHECKSIZE=`stat -f "$file"`               # this returns the filesize
        CHECKWIDTH=`identify -format "%W" "$file"`     # this returns the image width

        # next 'if' is true if either filesize >= 200000 bytes  OR  if image width >=201
        if [ $CHECKSIZE -ge  200 ] || [ $CHECKWIDTH -ge 201 ]; then
            thumbfile="$thumbdir/$(basename "$file").png"
            echo "$file -> $thumbfile" 
            convert -thumbnail 400 "$file" "$thumbfile"
        fi
      fi
    done
}

if [ $# -ne 1 ]; then
  echo "Usage $0 <path>"    
  exit 2                    
fi

find $1 -type d -not -path "*.ts" | while read dir
do
  generate_thumbnails "$dir"
done
