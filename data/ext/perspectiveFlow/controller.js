function myCtrl($scope) {
    $scope.data;
    $scope.TSCORE;

    $scope.update = function() {
        $scope.data = $scope.TSCORE.Search.searchData($scope.TSCORE.fileList, $scope.TSCORE.Search.nextQuery);
        $scope.$apply();
    };

    $scope.setTSCORE = function(tscore) {
        $scope.TSCORE = tscore;
    };

    $scope.selectFile = function(file) {
        console.log("Selecting file..."+file);
        $scope.TSCORE.PerspectiveManager.clearSelectedFiles();

        //var titleBut = $($event.target).parent().find(".fileTitleButton");

        //$(titleBut).parent().parent().toggleClass("ui-selected");
        //$(titleBut).parent().parent().find(".fileSelection").find("i")
        //    .toggleClass("fa-check-square")
        //    .toggleClass("fa-square-o");

        $scope.TSCORE.selectedFiles.push(file);
    };

    $scope.openFile = function(file) {
        console.log("Open file..."+file);
        $scope.TSCORE.FileOpener.openFile(file);
    };

    $scope.openContextMenu = function($event, file, tag) {
        console.log("Open context menu..."+file);
        $scope.TSCORE.hideAllDropDownMenus();
        //self.selectFile(this, $(this).attr("filepath"));
        $scope.TSCORE.openTagMenu($event.target, tag, file);
        $scope.TSCORE.showContextMenu("#tagMenu", $event.target);

    };
}

function myToolbarCtrl($scope) {
    $scope.TSCORE;
}