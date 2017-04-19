#!/bin/bash
#===============================================
# generate thumbnail images for tagspaces
#===============================================

generate_thumbnails() {
    dirname="$1"
    thumbdir="$dirname/.ts"
    echo "Current dir: $dirname"
    mkdir -p "$thumbdir"

    #for file in "$dirname/"*
    find "$dirname" -type f -maxdepth 1 | while read file
    do
      # next line checks the mime-type of the file
      CHECKTYPE=`file --mime-type -b "$file" | awk -F'/' '{print $1}'`
      CHECKFORMAT=`file --mime-type -b "$file" | awk -F'/' '{print $2}'`
      if [ "x$CHECKTYPE" == "ximage" ]; 
    then
        thumbfile="$thumbdir/$(basename "$file").png"
        CHECKWIDTH=`identify -format "%W" "$file"`     # this returns the image width

        #CHECKSIZE=`stat -f "%z" "$file"`               # MAC this returns the filesize
        CHECKSIZE=`stat -c %s "$file"`               # LINUX this returns the filesize

        #FILEDATE=`stat -f "%c" "$file"`                # MAC this returns the file timestamp
        FILEDATE=`stat -c %Z "$file"`                # LINUX this returns the file timestamp

        #echo "File - $file - Date: $FILEDATE - Size: $CHECKSIZE"

        if [ -f "$thumbfile" ]; then
          #THUMBFILEDATE=`stat -f "%c" "$thumbfile"` # MAC
          THUMBFILEDATE=`stat -c "%Z" "$thumbfile"`
          if [ $THUMBFILEDATE -gt $FILEDATE ]; then
            echo "$file is not changed"
            continue
          fi
        fi
        
        # next 'if' is true if either filesize >= 200000 bytes  OR  if image width >=201
        if [ $CHECKSIZE -ge  200000 ] || [ $CHECKWIDTH -ge 201 ]; then
            echo "$file -> $thumbfile" 
            if [ $CHECKFORMAT == "gif" ]; then
              # if image is animated gif we only want 1st frame
              file="$file[0]"
            fi
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
