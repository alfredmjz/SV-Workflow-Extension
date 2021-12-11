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
    var postTemplate = {
		"method" : "",
		"codeIndex" : "",
		"i18nEntityId" : 0,
		"i18nEntityName" : "",
		"isPageDisplayed" : true,
		"currentCode" : "",
		"currentCodeLabel" : "",
		"listTypeCode" : "",
		"code" : "",
		"Com_Destinyweb_Srs_Taglib_TableTag_Sort_Column1" : null,
		"Com_Destinyweb_Srs_Taglib_TableTag_Last_Sort_Column1" : null,
		"Com_Destinyweb_Srs_Taglib_Table_Sort1" : ""
	}

	//Retrieve section identifier
	var section_id = jq$('input[type=hidden][name="sectionId"]').val().trim();
	var context = jq$('span#contextHeaderSpan').text().trim();
    var course_id = context.match(/Custom Section# (.*)[x\-]/)[1];
    
    //Add section Preview
	jq$('<div style="padding-left:8px;display:inline;"><a target="_blank" href="https://continue.yorku.ca/student-evaluation-report/?section_id=' + section_id + '&course_id=' + course_id + '"><button type="button" class="yui3-button button-secondary" value="Preview" title="Preview">Preview Evaluations</button></a></div>').insertAfter(jq$('button#viewSessionAttendanceButton'));

    //Cycle students on grading sheet
    jq$('input[type=hidden][name^="listToBeRendered"][name$="student.objectId"]').each(function() {
    	
    	var object_id = jq$(this).val().trim();
    	var link = d1$.homeurl + 'student-evaluation-report/?section_id=' + section_id + '&object_id=' + object_id + '&course_id=' + course_id;
		
    	//Add buttons 
		jq$('<div style="padding-right:8px;display:inline;"><a target="_blank" href="' + link + '"><button type="button" class="yui3-button button-smallIntraForm " value="Preview" title="Preview">Preview</button></a></div>'
			).insertBefore(jq$(this).prevAll().find("button"));

    });
  

})(jQuery);