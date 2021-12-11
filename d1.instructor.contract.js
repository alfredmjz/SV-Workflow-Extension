(function(jq$) {
    'use strict';
    var contractID = getParameterByName('instructorContractId', '');
    jq$('<div class="bootstrapiso">'
			+'<strong>Contract ID: ' + contractID + '</strong>'
    	+'</div>')
    	.insertAfter("h1:eq(1)");

    function getParameterByName(name, url) {
     if (!url) url = window.location.href;
     name = name.replace(/[\[\]]/g, "\\$&");
     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
         results = regex.exec(url);
     if (!results) return null;
     if (!results[2]) return '';
     return decodeURIComponent(results[2].replace(/\+/g, " "));
 }
})(jQuery);