(function(jq$) {
    'use strict';
    jq$('<div class="bootstrapiso">'
			+'<strong>Custom Functions</strong>'
			+'<p>Assign Sections - Assign students randomly to sections with an equal gender and language mix.</p>'
			+'<ul>'
				+'<li>Bulk assign program offering sections to all students in a program offering dashboard</li>'
				+'<li>Distribute placements according to gender, language, and a pseudo-random token</li>'
			+'</ul>'
			+'<div class="btn-group">'
				+'<a class="btn btn-info text-white m-1" id="goAssignSections" name="goAssignSections" '
				+'title="Assign students to sections">'
				+'Assign Sections</a>'
			+'</div>'
    	+'</div>')
    	.insertAfter("h1");
})(jQuery);