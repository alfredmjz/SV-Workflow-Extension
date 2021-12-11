/*!
  * SV-Functions
  * Licensed under MIT
  */
(function(jq$) {

	'use strict';
	//jq$ is jQuery
	//d1$ is a global object for common functions and variables
    var debugging = true;
    var data = null;
    var rowCount = 0;
    var rowStart = 0;


    //Cycle students on grading sheet
    jq$('td.courseHistoryNameCol').each(function() {
    	

    	var course = jq$(this).text();
    	var row = jq$(this).parent();
    	var list_item = jq$('td.courseHistoryToolsCol > div > div[id^="toolbarMenuOptions"] > ul > li > a[id^="gradingSheet"]', row);
    	var grade_col = jq$('td.courseHistoryGradeCol', row);
    	var course_data = course.match(/Custom Section# (.*?)[x\-]/);
    	var grade_data = jq$(list_item).attr("onClick").match(/return gradingSheet\x28'(.*?)','(.*?)'\x29/);
    	var link = d1$.homeurl + 'student-evaluation-report/?object_id=' + grade_data[1] + '&course_id=' + course_data[1];
    	jq$(grade_col).html('<a target="_blank" href="' + link + '">' + jq$(grade_col).text() + '</a>');

    });
  

})(jQuery);