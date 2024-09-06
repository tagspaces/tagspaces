#!/bin/bash
#===============================================
# generate TagSpaces compatible thumbnails from images files
# with the help imagemagic
# supporting: jpg,png,gif,bmp,svg,webp,tiff
#===============================================
# usage:
# chmod +x thumbgen.sh
# ./thumbgen.sh /home/username/photos
#===============================================
#  TagSpaces - universal file and folder organizer
#  Copyright (C) 2017-present TagSpaces GmbH
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License (version 3) as
#  published by the Free Software Foundation.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.


generate_thumbnails() {
    dirname="$1"
    thumbdir="$dirname/.ts"
    echo "Current dir: $dirname"
    mkdir -p "$thumbdir"

    #for file in "$dirname/"*
    find "$dirname" -type f -maxdepth 1 | while read file
    do
      # next line checks the mime-type of the file
      # CHECKTYPE=`file --mime-type -b "$file" | awk -F'/' '{print $1}'`
      # if [ "x$CHECKTYPE" == "ximage" ];
			if [[ $file =~ .*\.(jpg|JPG|jpeg|JPEG|png|PNG|bmp|BMP|gif|GIF|webp|WEBP|tiff|TIFF|svg|SVG) ]]
    then
        thumbfile="$thumbdir/$(basename "$file").jpg"
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
