#!/usr/bin/env bash

testdir="./testdata-tmp/file-structure/supported-filestypes"
dirpath="$testdir/1000files-nothumbs"
jsonFile='{"appName":"TagSpaces","appVersion":"5.4.0","description":"","lastUpdated":1687873444575,"tags":[{"title":"1star","color":"#ffcc24","textcolor":"#ffffff","type":"sidecar"}],"id":"051cd049adad404c80d7d33e52feb8c2"}'

mkdir -p "$dirpath"/.ts
for i in $(seq 1 1000); do
    cp "$testdir/sample.png" $(printf "$dirpath/testfile[tag1]%04u.png" $i)
    echo "$jsonFile" > $(printf "$dirpath/.ts/testfile[tag1]%04u.png.json" $i)
done
