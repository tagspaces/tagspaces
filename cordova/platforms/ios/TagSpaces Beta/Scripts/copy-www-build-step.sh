#!/bin/sh
#
#    Licensed to the Apache Software Foundation (ASF) under one
#    or more contributor license agreements.  See the NOTICE file
#    distributed with this work for additional information
#    regarding copyright ownership.  The ASF licenses this file
#    to you under the Apache License, Version 2.0 (the
#    "License"); you may not use this file except in compliance
#    with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing,
#    software distributed under the License is distributed on an
#    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#    KIND, either express or implied.  See the License for the
#    specific language governing permissions and limitations
#    under the License.
#
#
#   This script copies the www directory into the Xcode project.
#
#   This script should not be called directly.
#   It is called as a build step from Xcode.

SRC_DIR="www"
DST_DIR="$BUILT_PRODUCTS_DIR/$FULL_PRODUCT_NAME"
DST_DIR_WWW="$DST_DIR/www"
COPY_HIDDEN=
ORIG_IFS=$IFS
IFS=$(echo -en "\n\b")

if [[ -z "$BUILT_PRODUCTS_DIR" ]]; then
  echo "The script is meant to be run as an Xcode build step and relies on env variables set by Xcode."
  exit 1
fi

if [[ ! -e "$SRC_DIR" ]]; then
  echo "error: Path does not exist: $SRC_DIR"
  exit 2
fi

rm -rf "$DST_DIR_WWW"

# Copy www dir recursively
CODE=
if [[ -n $COPY_HIDDEN ]]; then
    rsync -Lra "$SRC_DIR" "$DST_DIR"
    CODE=$?
else
    rsync -Lra --exclude="- .*" "$SRC_DIR" "$DST_DIR"
    CODE=$?
fi

if [ $CODE -ne 0 ]; then
    echo "error: Error occurred on copying www. Code $CODE"
    exit 3
fi

# Copy the config.xml file.
cp -f "${PROJECT_FILE_PATH%.xcodeproj}/config.xml" "$DST_DIR"

IFS=$ORIG_IFS
