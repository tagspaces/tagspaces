@echo off

if not exist extensions\ (mkdir extensions)

REM -------------------------
REM perspecitveGrid
REM -------------------------
if exist extensions\perspectiveGrid\ (
    cd extensions\perspectiveGrid
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/perspectiveGrid.git extensions\perspectiveGrid
    cd extensions\perspectiveGrid
)
call bower link
cd ..\..

REM -------------------------
REM perspectiveImageSwiper
REM -------------------------
if exist extensions\perspectiveImageSwiper\ (
    cd extensions\perspectiveImageSwiper
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/perspectiveImageSwiper.git extensions\perspectiveImageSwiper
    cd extensions\perspectiveImageSwiper
)
call bower link
cd ..\..

REM -------------------------
REM perspectiveList
REM -------------------------
if exist extensions\perspectiveList\ (
    cd extensions\perspectiveList
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/perspectiveList.git extensions\perspectiveList
    cd extensions\perspectiveList
)
call bower link
cd ..\..

REM -------------------------
REM perspectiveGraph
REM -------------------------
if exist extensions\perspectiveGraph\ (
    cd extensions\perspectiveGraph
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/perspectiveGraph.git extensions\perspectiveGraph
    cd extensions\perspectiveGraph
)
call bower link
cd ..\..

REM -------------------------
REM viewerHTML
REM -------------------------
if exist extensions\viewerHTML\ (
    cd extensions\viewerHTML
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerHTML.git extensions\viewerHTML
    cd extensions\viewerHTML
)
call bower link
cd ..\..

REM -------------------------
REM viewerImage
REM -------------------------
if exist extensions\viewerImage\ (
    cd extensions\viewerImage
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerImage.git extensions\viewerImage
    cd extensions\viewerImage
)
call bower link
cd ..\..

REM -------------------------
REM viewerMD
REM -------------------------
if exist extensions\viewerMD\ (
    cd extensions\viewerMD
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerMD.git extensions\viewerMD
    cd extensions\viewerMD
)
call bower link
cd ..\..

REM -------------------------
REM viewerMHTML
REM -------------------------
if exist extensions\viewerMHTML\ (
    cd extensions\viewerMHTML
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerMHTML.git extensions\viewerMHTML
    cd extensions\viewerMHTML
)
call bower link
cd ..\..

REM -------------------------
REM viewerURL
REM -------------------------
if exist extensions\viewerURL\ (
    cd extensions\viewerURL
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerURL.git extensions\viewerURL
    cd extensions\viewerURL
)
call bower link
cd ..\..

REM -------------------------
REM viewerZIP
REM -------------------------
if exist extensions\viewerZIP\ (
    cd extensions\viewerZIP
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerZIP.git extensions\viewerZIP
    cd extensions\viewerZIP
)
call bower link
cd ..\..

REM -------------------------
REM viewerPDF
REM -------------------------
if exist extensions\viewerPDF\ (
    cd extensions\viewerPDF
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerPDF.git extensions\viewerPDF
    cd extensions\viewerPDF
)
call bower link
cd ..\..

REM -------------------------
REM viewerText
REM -------------------------
if exist extensions\viewerText\ (
    cd extensions\viewerText
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerText.git extensions\viewerText
    cd extensions\viewerText
)
call bower link
cd ..\..

REM -------------------------
REM editorHTML
REM -------------------------
if exist extensions\editorHTML\ (
    cd extensions\editorHTML
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/editorHTML.git extensions\editorHTML
    cd extensions\editorHTML
)
call bower link
 cd ..\..

REM -------------------------
REM editorJSON
REM -------------------------
if exist extensions\editorJSON\ (
    cd extensions\editorJSON
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/editorJSON.git extensions\editorJSON
    cd extensions\editorJSON
)
call bower link
cd ..\..

REM -------------------------
REM editorODF
REM -------------------------
if exist extensions\editorODF\ (
    cd extensions\editorODF
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/editorODF.git extensions\editorODF
    cd extensions\editorODF
)
call bower link
cd ..\..

REM -------------------------
REM editorText
REM -------------------------
if exist extensions\editorText\ (
    cd extensions\editorText
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/editorText.git extensions\editorText
    cd extensions\editorText
)
call bower link
cd ..\..

REM -------------------------
REM viewerEPUB
REM -------------------------
if exist extensions\viewerEPUB\ (
    cd extensions\viewerEPUB
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerEPUB.git extensions\viewerEPUB
    cd extensions\viewerEPUB
)
call bower link
cd ..\..

REM -------------------------
REM viewerAudioVideo
REM -------------------------
if exist extensions\viewerAudioVideo\ (
    cd extensions\viewerAudioVideo
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerAudioVideo.git extensions\viewerAudioVideo
    cd extensions\viewerAudioVideo
)
call bower link
cd ..\..

REM -------------------------
REM viewerBrowser
REM -------------------------
if exist extensions\viewerBrowser\ (
    cd extensions\viewerBrowser
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerBrowser.git extensions\viewerBrowser
    cd extensions\viewerBrowser
)
call bower link
cd ..\..

REM -------------------------
REM viewerRTF
REM -------------------------
if exist extensions\viewerRTF\ (
    cd extensions\viewerRTF
    call git fetch --all
    call git checkout master
    call git pull
) else (
    call git clone https://github.com/tagspaces/viewerRTF.git extensions\viewerRTF
    cd extensions\viewerRTF
)
call bower link
cd ..\..

cd data
call bower link "HTML Editor" editorHTML
call bower link "Simple Viewer" viewerBrowser
call bower link "JSON Editor" editorJSON
call bower link "ODF Editor" editorODF
call bower link "Text Editor" editorText
call bower link "FolderViz" perspectiveGraph
call bower link "Grid" perspectiveGrid
call bower link "ImageSwiper" perspectiveImageSwiper
call bower link "List" perspectiveList
call bower link "Audio Video Player" viewerAudioVideo
call bower link "EPUB Reader" viewerEPUB
call bower link "HTML Reader" viewerHTML
call bower link "Image Viewer" viewerImage
call bower link "Markdown Reader" viewerMD
call bower link "MHTML Reader" viewerMHTML
call bower link "PDF Reader" viewerPDF
call bower link "Text Reader" viewerText
call bower link "Link Opener" viewerURL
call bower link "ZIP Opener" viewerZIP
call bower link "rtf-viewer" viewerRTF
cd ..