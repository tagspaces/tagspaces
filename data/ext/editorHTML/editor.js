function initEditor(cleanedBodyContent) {
    $htmlEditor = $('#htmlEditor');
    $htmlEditor.append(cleanedBodyContent);
    $htmlEditor.summernote({
        focus: true,
        height: "100%",
        /*toolbar: [
            ['style', ['style']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['picture', 'link']],
            ['table', ['table']],
            ['view', ['codeview']]
        ],*/
        onkeyup: function() {
            contentVersion++;
        }
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function init() {
    var filePath = getParameterByName("cp");
    $.ajax({
        url: "file://"+filePath,
        type: 'POST'
    })
        .done(function(data) {
            originalContent = data;
            cleanContent(data);
        })
        .fail(function(data) {
            console.log("AJAX failed "+data);
        });
}

var originalContent;
function getOriginalContent() {
    return originalContent;
}

var contentVersion = 0;
function resetContentVersion() {
    contentVersion = 0;
}

function getContentVersion() {
    return contentVersion;
}

function cleanContent(content) {
    var bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m;
    var bodyContent = undefined;

    try {
        bodyContent = content.match( bodyRegex )[1];
    } catch(e) {
        console.log("Error parsing HTML document. "+e);
        alert("Document could not be proceeded, probably a body tag was! ","Error parsing HTML document");
    }

//        var titleRegex = /\<title[^>]*\>([^]*)\<\/title/m;
//        var titleContent = content.match( titleRegex )[1];

    // removing all scripts from the document
    var cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");
    initEditor(cleanedBodyContent)
}

init();