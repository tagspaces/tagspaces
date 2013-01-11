/**
 *  Croppr is a Structmedia Experiment.      
 *                                 
 *  Version: 1.12
 *                                                                          
 *  MaWeRe - Makes the Web Readable !   
 *
 *                                                                          
 *  Most of the icons used in this extension are from:
 *  http://gentleface.com/free_icon_set.html         
 *                                                                          
 *  Licensed under the Apache License, Version 2.0 (the "License");         
 *  you may not use this file except in compliance with the License.        
 *  You may obtain a copy of the License at                                 
 *                                                                          
 *  http://www.apache.org/licenses/LICENSE-2.0                           
 *                                                                          
 *  Unless required by applicable law or agreed to in writing, software     
 *  distributed under the License is distributed on an "AS IS" BASIS,       
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and     
 *  limitations under the License.                                           
 */

var Croppr = (typeof Croppr == 'object' && Croppr != null) ? Croppr : {};
    
Croppr.cropprColors = ['croppr-white', 'croppr-black', 'croppr-blue'];
Croppr.cropprColor = (Croppr.cropprColor==null)?Croppr.cropprColors[1]:Croppr.cropprColor;

Croppr.logger = {
  isEnabled : function() {
    return true;   
  },
  debug : function(msg) {
    if (Croppr.logger.isEnabled() && typeof console == 'object' && console != null && typeof console["log"] == 'function') {
      console.log(msg);
    }
  }
};

Croppr.rotateXYStep = 180;
Croppr.currentRotationXAngle = 0;
Croppr.currentRotationYAngle = 0;

Croppr.rotateStep = 90;
Croppr.currentRotationAngle = 0;

Croppr.zoomStep = 0.3;
Croppr.currentZoomLevel = 1;

Croppr.updateTransformations = function() {
    $('#cropprBody').attr('style', '-webkit-transform: rotate('+Croppr.currentRotationAngle+'deg) scale('+Croppr.currentZoomLevel+') rotateX('+Croppr.currentRotationXAngle+'deg) rotateY('+Croppr.currentRotationYAngle+'deg)');
};

Croppr.rotateRight = function() {
    Croppr.currentRotationAngle = Croppr.currentRotationAngle + Croppr.rotateStep;
    Croppr.updateTransformations();
};

Croppr.rotateLeft = function() {
    Croppr.currentRotationAngle = Croppr.currentRotationAngle - Croppr.rotateStep;
    Croppr.updateTransformations();
};

Croppr.flipVertically = function() {
    Croppr.currentRotationYAngle = Croppr.currentRotationYAngle + Croppr.rotateXYStep;
    Croppr.updateTransformations();
};

Croppr.flipHorizontally = function() {
    Croppr.currentRotationXAngle = Croppr.currentRotationXAngle + Croppr.rotateXYStep;
    Croppr.updateTransformations();
};

Croppr.zoomIn = function() {
    Croppr.currentZoomLevel = Croppr.currentZoomLevel + Croppr.zoomStep;
    Croppr.updateTransformations();
};

Croppr.zoomOut = function() {
    Croppr.currentZoomLevel = Croppr.currentZoomLevel - Croppr.zoomStep;
    Croppr.updateTransformations();
};

// Resize the content image to fit in the viewport 
Croppr.fitViewport = function() {
    var newWidth = null;
    var newHeight = null;

    if($('#imageContent').width() > window.innerWidth) {
        newWidth = window.innerWidth;
        newHeight = Math.round(newWidth * $('#imageContent').height() / $('#imageContent').width());
    }
    $('#imageContent').attr('style', 'width: '+newWidth+'px; height: '+newHeight+'px;');

    if($('#imageContent').height() > window.innerHeight) {
        newHeight = window.innerHeight;
        newWidth = Math.round(newHeight * $('#imageContent').width() / $('#imageContent').height());
    }
    $('#imageContent').attr('style', 'width: '+newWidth+'px; height: '+newHeight+'px;');
//    Croppr.logger.debug("W: "+newWidth+" H: "+newHeight+" Viewport: "+window.innerWidth);
};

Croppr.reset = function() {
    Croppr.currentRotationXAngle = 0;
    Croppr.currentRotationYAngle = 0;
    Croppr.currentRotationAngle = 0;
    Croppr.currentZoomLevel = 1;
    $('#cropprBody').attr('style', '-webkit-transform: rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg)');
    Croppr.fitViewport();
};

Croppr.toggleColor = function() {
    $('body').removeClass(Croppr.cropprColor);   
    var currentIndex = Croppr.cropprColors.indexOf(Croppr.cropprColor);
    var nextIndex = currentIndex+1;
    if (nextIndex >= Croppr.cropprColors.length) { nextIndex = 0; }    
    Croppr.cropprColor = Croppr.cropprColors[nextIndex];
    $('body').addClass(Croppr.cropprColor);
};

Croppr.enableEventHandling = function() {
  $(document).ready(function(){     

    // Fit the content to viewport
    Croppr.fitViewport();
    
    // Shows the cropper toolbox
    $("#cropprMenu").show();   

    $(window).resize(function() {
      Croppr.fitViewport();
    });
   
    $("#cropprClose").click( function() {      
      $("#cropprMenu").hide();    
    });    

    $("#cropprColors").click( function() {
      Croppr.toggleColor();
    });     

    $("#cropprRotateRight").click( function() {
      Croppr.rotateRight();  
    });   
	
    $("#cropprRotateLeft").click( function() {
      Croppr.rotateLeft(); 
    }); 

    $("#cropprFlipVertically").click( function() {
      Croppr.flipVertically();
    }); 

    $("#cropprFlipHorizontally").click( function() {
      Croppr.flipHorizontally();
    }); 
    
    $("#cropprZoomIn").click( function() {
      Croppr.zoomIn();
    }); 
    
    $("#cropprZoomOut").click( function() {
      Croppr.zoomOut();
    });         
	
    $("#cropprEvernote").click( function() {
      Evernote.doClip({contentId:'cropprBody',code:'Ilia8863'});
    });   

    $("#cropprFacebook").click( function() {
      window.location.href="http://www.facebook.com/sharer.php?u="+encodeURIComponent(Croppr.biggestImageUrl)+"&t="+encodeURIComponent('Shared through croppr chrome extension!');
    });   

    $("#cropprTwitter").click( function() {
      window.location.href="http://twitter.com/share?url="+encodeURIComponent(Croppr.biggestImageUrl)+"&r=cr";
    });
    
    $("#cropprReset").click( function() {
      Croppr.reset();
    }); 
    
    $("#cropprReload").click( function() {
      window.location.reload();
    }); 

    $("#cropprAbout").click( function() {
      window.location.href="http://mawere.com";        
    });     
	        
    $("#cropprPrint").click( function() {
      $("#cropprMenu").hide();    
      window.print(); 
    });       
	
  });    
};

Croppr.findLinksToImages = function() {
  $("a").each(function(index) {
    Croppr.logger.debug("index: " + index + " href: " + $(this).attr('href'));
  });
};

Croppr.findBiggestImage = function() {
  var indexBiggestImage = 0;
  var areaBiggestImage = 0;
  $("img").each(function(index) {
    var area = $(this).width()*$(this).height();
    if(area > areaBiggestImage) {
      indexBiggestImage = index;
      areaBiggestImage = area;
    }
    Croppr.logger.debug("index: " + index + " w: " + $(this).width() + " h: "+$(this).height() + " m2: " + area + " src: " +$("img")[index].src + " - " +indexBiggestImage);
  });
  
  Croppr.logger.debug(indexBiggestImage + " - " + $("img")[indexBiggestImage].src);
  
  return $("img")[indexBiggestImage].src;
};

Croppr.biggestImageUrl = "";

Croppr.initCroppr = function() { 
  Croppr.biggestImageUrl =  Croppr.findBiggestImage();  
  
  // ToDo
  Croppr.findLinksToImages();

  // Generating croppr toolbox
  var cropprToolboxDiv  = document.createElement("DIV"); 
  cropprToolboxDiv.id        = "cropprMenu";
  cropprToolboxDiv.innerHTML = '' +
'<div id="cropprColors" style="background-image: url(./imgs/color.png);" title="Change the background color">&nbsp;</div>'+
'<div id="cropprRotateLeft" style="background-image: url(./imgs/rotateleft.png);" title="Rotate to the left">&nbsp;</div>'+
'<div id="cropprRotateRight" style="background-image: url(./imgs/rotateright.png);" title="Rotate to the right">&nbsp;</div>'+
'<div id="cropprFlipHorizontally" style="background-image: url(./imgs/fliph.png);" title="Flip horizontally">&nbsp;</div>'+
'<div id="cropprFlipVertically" style="background-image: url(./imgs/flipv.png);" title="Flip vertically">&nbsp;</div>'+
'<div id="cropprZoomIn" style="background-image: url(./imgs/zoomin.png);" title="Zoom in">&nbsp;</div>'+
'<div id="cropprZoomOut" style="background-image: url(./imgs/zoomout.png);" title="Zoom out">&nbsp;</div>'+  
'<div id="cropprReset" style="background-image: url(./imgs/reset.png);" title="Reset the image">&nbsp;</div>'+  
'<div id="cropprTwitter" style="background-image: url(./imgs/twitter.png);" title="Send to Twitter">&nbsp;</div>'+
'<div id="cropprFacebook" style="background-image: url(./imgs/facebook.png);" title="Send to Facebook">&nbsp;</div>'+
'<div id="cropprPrint" style="background-image: url(./imgs/print.png);" title="Print">&nbsp;</div>'+
'<div id="cropprReload" style="background-image: url(./imgs/reload.png);" title="Reload the original page">&nbsp;</div>'+
'<div id="cropprAbout" style="background-image: url(./imgs/about.png);" title="About Croppr">&nbsp;</div>'+
'<div id="cropprClose" style="background-image: url(./imgs/close.png);" title="Closes this toolbox">&nbsp;</div>'+
	'';

  var contentDiv  = document.createElement("DIV"); 
  contentDiv.id        = "cropprBody";
  contentDiv.style     = "";
  contentDiv.innerHTML = '' +
	// '<a href="'+biggestImageUrl+'" target="_blank" style="border: 0px;"><img id="imageContent" src="'+biggestImageUrl+'"></a>'+
	'<img id="imageContent" src="'+Croppr.biggestImageUrl+'">'+
	'';

  // Clears the document content 
//  document.body.innerHTML = "";
  
  // Inserts the content on the page 
  document.body.insertBefore(contentDiv, document.body.firstChild); 

  // Remove all stylesheets 
//  document.body.removeAttribute('style');  
//  for (var i=0; i < document.styleSheets.length; i++) {
//      if (document.styleSheets[i].href !== null && document.styleSheets[i].href.lastIndexOf("croppr") == -1) {
//	  document.styleSheets[i].disabled = true;
//      }
//  }

  // Sets the background color of the page to the default color(black)  
//  $('body').attr('class', '');
//  $('body').addClass(Croppr.cropprColor);

  // Centers the content on the page      
//  document.documentElement.style.display = 'table';
//  document.documentElement.style.width = '100%';
//  document.documentElement.style.height = '100%';
//  document.documentElement.style.background = '#000';
//  document.body.style.display = 'table-cell';
//  document.body.style.verticalAlign = 'middle';
//  document.body.style.textAlign = 'center';

  // Inserts the croppr's toolbox on the page   
  document.body.insertBefore(cropprToolboxDiv, document.body.firstChild);  
 
  Croppr.enableEventHandling(); 
};
Croppr.initCroppr();
