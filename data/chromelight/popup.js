//document.ready = function() {
    var startTS = document.getElementById("startTagSpaces");
    startTS.onclick = function (e) {
        chrome.tabs.create({url: '../index.html'});
    };

    var saveAsMhtml = document.getElementById("saveAsMhtml");
    var tags;
    saveAsMhtml.onclick = function (e) {
        chrome.tabs.getSelected(null, function(tab) {
            tags = document.getElementById("tags").value;
            chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function (mhtml) {
                if(tags) {
                    tags = tags.split(",").join(" ");
                    saveAs(mhtml, tab.title +' ['+tags+'].mhtml');
                } else {
                   saveAs(mhtml, tab.title + '.mhtml');
                }
            });
        });
    };
//}