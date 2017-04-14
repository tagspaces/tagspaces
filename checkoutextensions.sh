#!/bin/bash
if [ ! -d "extensions" ]; then
    mkdir extensions
fi


# -------------------------
# perspectiveGrid
# -------------------------
if [ -d "extensions/perspectiveGrid" ]; then
    cd extensions/perspectiveGrid
    git fetch --all
else
    git clone https://github.com/tagspaces/perspectiveGrid.git extensions/perspectiveGrid
    cd extensions/perspectiveGrid
fi
bower link
cd ../..

# -------------------------
# perspectiveImageSwiper
# -------------------------
if [ -d "extensions/perspectiveImageSwiper" ]; then
    cd extensions/perspectiveImageSwiper
    git fetch --all
else
    git clone https://github.com/tagspaces/perspectiveImageSwiper.git extensions/perspectiveImageSwiper
    cd extensions/perspectiveImageSwiper
fi
bower link
cd ../..

# -------------------------
# perspectiveList
# -------------------------
if [ -d "extensions/perspectiveList" ]; then
    cd extensions/perspectiveList
    git fetch --all
else
    git clone https://github.com/tagspaces/perspectiveList.git extensions/perspectiveList
    cd extensions/perspectiveList
fi
bower link
cd ../..


# -------------------------
# perspectiveGraph
# -------------------------
if [ -d "extensions/perspectiveGraph" ]; then
    cd extensions/perspectiveGraph
    git fetch --all
else
    git clone https://github.com/tagspaces/perspectiveGraph.git extensions/perspectiveGraph
    cd extensions/perspectiveGraph
fi
bower link
cd ../..


# -------------------------
# viewerHTML
# -------------------------
if [ -d "extensions/viewerHTML" ]; then
    cd extensions/viewerHTML
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerHTML.git extensions/viewerHTML
    cd extensions/viewerHTML
fi
bower link
cd ../..

# -------------------------
# viewerImage
# -------------------------
if [ -d "extensions/viewerImage" ]; then
    cd extensions/viewerImage
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerImage.git extensions/viewerImage
    cd extensions/viewerImage
fi
bower link
cd ../..

# -------------------------
# viewerMD
# -------------------------
if [ -d "extensions/viewerMD" ]; then
    cd extensions/viewerMD
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerMD.git extensions/viewerMD
    cd extensions/viewerMD
fi
bower link
cd ../..

# -------------------------
# viewerMHTML
# -------------------------
if [ -d "extensions/viewerMHTML" ]; then
    cd extensions/viewerMHTML
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerMHTML.git extensions/viewerMHTML
    cd extensions/viewerMHTML
fi
bower link
cd ../..

# -------------------------
# viewerURL
# -------------------------
if [ -d "extensions/viewerURL" ]; then
    cd extensions/viewerURL
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerURL.git extensions/viewerURL
    cd extensions/viewerURL
fi
bower link
cd ../..

# -------------------------
# viewerZIP
# -------------------------
if [ -d "extensions/viewerZIP" ]; then
    cd extensions/viewerZIP
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerZIP.git extensions/viewerZIP
    cd extensions/viewerZIP
fi
bower link
cd ../..

# -------------------------
# viewerPDF
# -------------------------
if [ -d "extensions/viewerPDF" ]; then
    cd extensions/viewerPDF
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerPDF.git extensions/viewerPDF
    cd extensions/viewerPDF
fi
bower link
cd ../..

# -------------------------
# viewerText
# -------------------------
if [ -d "extensions/viewerText" ]; then
    cd extensions/viewerText
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerText.git extensions/viewerText
    cd extensions/viewerText
fi
bower link
cd ../..

# -------------------------
# editorHTML
# -------------------------
if [ -d "extensions/editorHTML" ]; then
    cd extensions/editorHTML
    git fetch --all
else
    git clone https://github.com/tagspaces/editorHTML.git extensions/editorHTML
    cd extensions/editorHTML
fi
bower link
cd ../..

# -------------------------
# editorJSONv
# -------------------------
if [ -d "extensions/editorJSON" ]; then
    cd extensions/editorJSON
    git fetch --all
else
    git clone https://github.com/tagspaces/editorJSON.git extensions/editorJSON
    cd extensions/editorJSON
fi
bower link
cd ../..

# -------------------------
# editorODF
# -------------------------
if [ -d "extensions/editorODF" ]; then
    cd extensions/editorODF
    git fetch --all
else
    git clone https://github.com/tagspaces/editorODF.git extensions/editorODF
    cd extensions/editorODF
fi
bower link
cd ../..

# -------------------------
# editorText
# -------------------------
if [ -d "extensions/editorText" ]; then
    cd extensions/editorText
    git fetch --all
else
    git clone https://github.com/tagspaces/editorText.git extensions/editorText
    cd extensions/editorText
fi
bower link
cd ../..

# -------------------------
# viewerEPUB
# -------------------------
if [ -d "extensions/viewerEPUB" ]; then
    cd extensions/viewerEPUB
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerEPUB.git extensions/viewerEPUB
    cd extensions/viewerEPUB
fi
bower link
cd ../..

# -------------------------
# viewerAudioVideo
# -------------------------
if [ -d "extensions/viewerAudioVideo" ]; then
    cd extensions/viewerAudioVideo
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerAudioVideo.git extensions/viewerAudioVideo
    cd extensions/viewerAudioVideo
fi
bower link
cd ../..

# -------------------------
# viewerBrowser
# -------------------------
if [ -d "extensions/viewerBrowser" ]; then
    cd extensions/viewerBrowser
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerBrowser.git extensions/viewerBrowser
    cd extensions/viewerBrowser
fi
bower link
cd ../..

# -------------------------
# viewerRTF
# -------------------------
if [ -d "extensions/viewerRTF" ]; then
    cd extensions/viewerRTF
    git fetch --all
else
    git clone https://github.com/tagspaces/viewerRTF.git extensions/viewerRTF
    cd extensions/viewerRTF
fi
bower link
cd ../..

cd data
bower link "HTML Editor" editorHTML
bower link "Simple Viewer" viewerBrowser
bower link "JSON Editor" editorJSON
bower link "ODF Editor" editorODF
bower link "Text Editor" editorText
bower link "FolderViz" perspectiveGraph
bower link "Grid" perspectiveGrid
bower link "ImageSwiper" perspectiveImageSwiper
bower link "List" perspectiveList
bower link "Audio Video Player" viewerAudioVideo
bower link "EPUB Reader" viewerEPUB
bower link "HTML Reader" viewerHTML
bower link "Image Viewer" viewerImage
bower link "Markdown Reader" viewerMD
bower link "MHTML Reader" viewerMHTML
bower link "PDF Reader" viewerPDF
bower link "Text Reader" viewerText
bower link "Link Opener" viewerURL
bower link "ZIP Opener" viewerZIP
bower link "rtf-viewer" viewerRTF
cd ..

