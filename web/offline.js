document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    var reloadButton = document.getElementById('reload');
    reloadButton.onclick = function() {
      location.reload();
    }
  }
};
