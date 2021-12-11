(function(jq$) {
    'use strict';
    jq$('<div class="bootstrapiso">'
			+'<strong>Custom Functions</strong>'
			+'<p>Assign Levels - Assign students to curriculum levels based on test score concordance.</p>'
			+'<ul>'
				+'<li>Bulk assign program offering levels to all students in a program offering dashboard</li>'
				+'<li>Create one or more concordance tables in JSON</li>'
				+'<li>Cycle all participants in dashboard or filter on unassigned participants only</li>'
				+'<li>Optionally merge data from other internal/external sources</li>'
			+'</ul>'
			+'<div class="btn-group">'
				+'<a class="btn btn-info text-white m-1" id="goAssignLevel" name="goAssignLevel" '
				+'title="Assign all students to a level based on test score(s)">'
				+'Assign Levels (All)</a>'			
				+'<a class="btn btn-info text-white m-1" id="goAssignUnassignedLevel" name="goAssignUnassignedLevel" '
				+'title="Assign unassigned students to a level based on test score(s)">'
				+'Assign Levels (Unassigned)</a>'
			+'</div>'
    	+'</div>')
    	.insertAfter("h1");
})(jQuery);