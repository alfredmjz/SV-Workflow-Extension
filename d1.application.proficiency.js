/*!
  * SV-Functions
  * Licensed under MIT
  */
(function(jq$) {
		
	'use strict';
	//jq$ is jQuery
	//d1$ is a global object for common functions and variables
    var debugging = true;
    
    //Add button to update exam proficiency information after the pre-arranged exam date input
    jq$('<div class="bootstrapiso">'
    	+'<a class="btn btn-info text-white m-1" id="goUpdateExamProficiency" name="goUpdateExamProficiency" '
    	+'title="Update exam proficiency record(s) in student profile">'
    	+'Update Exam Proficiency</a>'
    	+'</div>')
    	.insertAfter("div.subscript:contains('Exam Proficiency: Date')");
    	
    //Retrieve exam proficiency information for the selected student
    var examData = [], examList = [], examCols = [];
	var studentId = jq$('a[href*="studentId="').attr('href').split("studentId=")[1];
	var searchUrl = 
	 'https://'
	 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
	 +'/srs/enrolmgr/student/proficiencyexamscores.do?method=loadCreate&studentId=<studentId>'
	 
	if (debugging) console.log('Lookup exam proficiency information for '+studentId);
	
	jq$.ajax({
			
		type: "GET",
		url: searchUrl.replace("<studentId>",studentId),
		success: function (data) {

			//Parse list of exam proficiencies
			examList = jq$("#exam option",data).map(function(){
				return [this.value,this.text];
  			}).get();
  			
  			//Parse exam proficiency column headers
  			examCols = jq$("#proficiencyExamScore",data).find('thead > tr').map(function(){
  				return jq$("th", this).text().split("\n").slice(1);
  			}).get();
    
  			//Parse exam proficiency row data
  			examData = jq$("#proficiencyExamScore",data).find('tbody > tr').map(function(){
  				return [ jq$("td", this).map(function(){ return $(this).text().replace("\n","").trim();}).get() ];
        	}).get();
        	
        	if (debugging) console.log('Exam proficiency lookup success:\n'+JSON.stringify(examData,null,4));
        	
        	//Cycle exam proficiency scores and add lookup information
        	//var examDay = jq$("div.subscript:contains('Exam Proficiency: Date')").prevAll("input[name*=day]").val();
        	//var examMonth = jq$("div.subscript:contains('Exam Proficiency: Date')").prevAll("input[name*=month]").val();
        	//var examYear = jq$("div.subscript:contains('Exam Proficiency: Date')").prevAll("input[name*=year]").val();
        	jq$("div.subscript:contains('Exam Proficiency:')").each(function(){
        		
        		//For exam proficiency score input:
				if (jq$(this).text() !== 'Exam Proficiency: Date') {
					var i, len, exam_html = '';
					var examCode = jq$(this).text().replace('Exam Proficiency:','').trim();
					var examScore = jq$(this).prevAll('input').val();
					
					//Cycle existing exam proficiency data
					for (len=examData.length, i=0; i<len; ++i) {
						
						//Show items matching the current exam proficiency input 
						if (examCode == examData[i][0].split("-")[0].trim()) {
							
							//Add label for existing exam proficiency and label
							exam_html += '<a href="/srs/enrolmgr/student/proficiencyexamscores.do?method=loadCreate&studentId=' + studentId + '">'
							 + examCode + ' ' + examData[i][1] + ' (' + examData[i][3] + ')</a>';
							 
							//Add note if this exam proficiency input is already updated
							if (parseFloat(examScore) == parseFloat(examData[i][1].trim())) {
								
								exam_html += ' <span class="profupdated"><img src="/srs/images/form/accept.gif" height="16" width="16" border="0">'
								 + ' Exam proficiency updated!</span><br />';
								
							}

						}
						
					}
					
					//Insert after subscript caption
					jq$('<div>'+exam_html+'</div>')
					 .insertAfter(this);

				}
				
			});	
			
		},
		
		error: function (msg) {
			
			if (debugging) console.log('Exam proficiency lookup FAILED:\n'+JSON.stringify(msg,null,4));
			
		}
	});
        
	
    //Create event trigger for button
    jq$('#goUpdateExamProficiency').click(function(event) { 
    		
        //Show progress bar
        d1$.showProgress();
        
        //Cycle exam proficiency inputs and call for update
        var update_count = 0;
    	jq$("div.subscript:contains('Exam Proficiency:')").each(function(){
    		
    		//For exam proficiency score input:
    		if (jq$(this).text() !== 'Exam Proficiency: Date') {
    			
    			//Where a record matching this exam proficiency and score does not already exist and the score input is not empty
    			if (jq$(this).nextAll().find('span.profupdated').length <= 0 && d1$.isEmpty(jq$(this).prevAll('input').val()) == false) {
    			
    				//Create exam proficiency record for (this) exam score
    				var $examDate = jq$("div.subscript:contains('Exam Proficiency: Date')");
    				
    				d1_update_exam_proficiency(
						jq$(this).text().replace('Exam Proficiency:','').trim(),
						jq$(this).prevAll('input').val(),
						$examDate.prevAll("input[type=text]").val(),
						$examDate.prevAll("input[name*=day]").val(),
						$examDate.prevAll("input[name*=month]").val()-1,		//Month is stored as an index from 0 to 11 (inconsistent with other pages)
						$examDate.prevAll("input[name*=year]").val()
					);
					
					++update_count;
					
				}
				
			}
			
    	});
    	
    	//Finish
        d1$.hideProgress();
        if (update_count > 0) location.reload();
        if (update_count == 0) alert('Nothing to update!');
        if (debugging) console.log('Finished');

    });
    
    
    //Create exam proficiency record(s) 
    function d1_update_exam_proficiency (examCode, examScore, examDate, examDay, examMonth, examYear) {

        //Determine examId; cycle list of exam proficiencies (examList)
		var i, len, examId = 0;
		for (len=examList.length, i=0; i<len; i=i+2) {
			
			if (d1$.isEmpty(examList[i+1]) == false && examCode == examList[i+1].split("-")[0].trim()) {
				
				examId = examList[i];
				break;
				
			}
			
		}
		
		if (debugging) console.log('Updating exam proficiency record:\n'+JSON.stringify([examCode, examScore, examDate, examDay, examMonth, examYear], null, 4));
		
		//Select exam proficiency type
		jq$.ajax({
				
			url:  
			 "https://"
			 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
			 + "/srs/enrolmgr/student/proficiencyexamscores.do",
			type: "POST",
			async: false,
			data: {
				
				method: "selectExam",
				entityId: "",
				studentId: parseInt(studentId),
				examId: parseInt(examId),
				gradeScore: "",
				testDateString: "",
				"testDate.day": "",
				"testDate.month": "", 
				"testDate.year": "",
				effectiveDateRangeStartString: "",
				"effectiveDateRangeStart.day": "", 
				"effectiveDateRangeStart.month": "", 
				"effectiveDateRangeStart.year": "", 
				"effectiveDateRangeEndString": "",
				"effectiveDateRangeEnd.day": "",
				"effectiveDateRangeEnd.month": "",
				"effectiveDateRangeEnd.year": ""
				
			},
			
			success:function(response) {
				
				if (debugging) console.log('Select exam response:\n'+JSON.stringify(response,null,4));
				
			},
			
			error:function(msg){
				
				if (debugging) console.log('Select exam FAILED:\n'+JSON.stringify(msg,null,4));
				
			}
			
		});
		
		//Create exam proficiency record for the current student
		jq$.ajax({
				
			url:  
			 "https://"
			 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
			 + "/srs/enrolmgr/student/proficiencyexamscores.do",
			type: "POST",
			async: false,
			data: {
				
				method: "create",
				entityId: "",
				studentId: parseInt(studentId),
				examId: parseInt(examId),
				gradeScore: examScore,
				testDateString: examDate,
				"testDate.day": parseInt(examDay),
				"testDate.month": parseInt(examMonth), 
				"testDate.year": parseInt(examYear),
				effectiveDateRangeStartString: "",
				"effectiveDateRangeStart.day": "", 
				"effectiveDateRangeStart.month": "", 
				"effectiveDateRangeStart.year": "", 
				"effectiveDateRangeEndString": "",
				"effectiveDateRangeEnd.day": "",
				"effectiveDateRangeEnd.month": "",
				"effectiveDateRangeEnd.year": ""
				
			},
			
			success:function(response) {
				
				if (debugging) console.log('Update response:\n'+JSON.stringify(response,null,4));
				
			},
			
			error:function(msg){
				
				if (debugging) console.log('Update FAILED:\n'+JSON.stringify(msg,null,4));
				
			}
			
		});
		
        return true;
        
    }
    
})(jQuery);