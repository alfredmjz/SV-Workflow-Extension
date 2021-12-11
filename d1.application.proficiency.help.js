(function(jq$) {
    'use strict';
    jq$('<div class="bootstrapiso">'
			+'<strong>Custom Functions</strong>'
			+'<p>Update Exam Proficiency - View and create exam proficiency record(s) from the application questionnaire.</p>'
			+'<ul>'
				+'<li>View and jump to existing exam proficiency record(s)</li>'
				+'<li>Create exam proficiency record(s) with a single click</li>'
			+'</ul>'
			+'<div class="btn-group">'
				+'<a class="btn btn-info text-white m-1" id="goUpdateExamProficiency" name="goUpdateExamProficiency" '
				+'title="Create exam proficiency record(s)">'
				+'Update Exam Proficiency</a>'
			+'</div>'
    	+'</div>')
    	.insertAfter("h1");
})(jQuery);