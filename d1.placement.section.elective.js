/*!
  * SV-Functions
  * Licensed under MIT
  */
  
(function(jq$) {
		
    'use strict';
	//jq$ is jQuery
	//d1$ is a global object for common functions and variables
    var debugging = true;
    
    
    //Add button to assign sections
    jq$('<div class="bootstrapiso">'
    	+'<a class="btn btn-info text-white m-1 mt-3" id="goAssignSection" name="goAssignSection" '
    	+'title="Assign all students to sections based on preference(s) and capacity">'
    	+'Assign Sections</a>'
    	+'</div>')
    	.insertAfter("#batchEnrollStudents");

    //Update list options
    jq$('select.ui-pg-selbox').append('<option role="option" value="250">250</option><option role="option" value="501">501</option>');
    	
    //Create event trigger for button
    jq$('#goAssignSection').click(function(event) { d1_placement_elective(); });

    
    //Assign section based on an equal gender and language mix
    function d1_placement_elective () {
    	
        var students = [];
        var classes = [];
        var i = 0;
    	var rowno = 1;
        var rowdata = {};
        var update_count = 0;
        var retrieve = false;

        //Confirm with user
        if (!confirm('Proceed with section assignment?')) return false;
        
        //Show progress bar
        d1$.showProgress();
        
        //Cycle passes (3)
        for (var pass = 1; pass < 4; ++pass) {
        	if (debugging) console.log('Pass #'+pass+'\n');
        	
        	//Cycle courses
			jq$('#filterOptions option').each(function() {
					
				//Load course
				var section_id = jq$(this).val();
				jq$('#filterOptions').val(section_id).change();
				var form = document.forms[0];
				form.method.value = 'loadDashboard';
				form.submit();
	
				jq$('select.ui-pg-selbox').val('250').change();
				if (debugging) console.log('Section #'+section_id+'\n');
				
				//Cycle cells in section placement grid and for each row create a key-value store (students[n].key)
				if (retrieve == false) {
					jq$('table[id^=sectionPlacement][id$=Grid] tr.jqgrow td').each(function() {
							
						var fld = jq$(this).attr("aria-describedby").replace("sectionPlacementGrid_","").replace("sectionPlacementRequiredGrid_","").replace("sectionPlacementElectiveGrid_","");
						var val = jq$(this).text().trim();
						
						if (fld == "rn" && rowno != parseInt(val)) {
							
							rowno = parseInt(val);
							rowdata.SECTION = "";
							jq$.ajaxSetup({async: false});
							jq$.getJSON('https://continue.yorku.ca/api/destiny/getStudentElectiveExclusionsP.php?studentId='+rowdata.studentNumber+'&schoolId='+rowdata.schoolPersonnelNumber+'&prCode=PR0001', function (response) {
								if ('data' in response) {
									if ('level' in response.data) {
										rowdata.level = response.data.level.replace("AP","");
									}
									if ('excl' in response.data) {
										rowdata.excl = response.data.excl;
									}							
								}
							});	
							jq$.ajaxSetup({async: true});
							students[students.length] = rowdata;
							rowdata = {};
							
						}
						
						rowdata[fld] = val;
						
					});	
					
					students[students.length] = rowdata;
					retrieve = true;
				}
		
				//Store list of classes
				if (pass == 1) { 
					jq$("#bulkPlacementSection option").each(function() {
							
						i = classes.length;
						if (!d1$.isEmpty(jq$(this).text())) {
							
							classes[i] = {};
							classes[i].class_id = jq$(this).val();
							classes[i].class_name = jq$(this).text();
							classes[i].instructor = "";
							classes[i].min_level = jq$(this).text().substring(jq$(this).text().indexOf("Level AP")+8,jq$(this).text().indexOf("Level AP")+9);
							if (jq$(this).text().indexOf("to AP") != -1) {
								classes[i].max_level = jq$(this).text().substring(jq$(this).text().indexOf("to AP")+5,jq$(this).text().indexOf("to AP")+6);
							} else {
								classes[i].max_level = classes[i].min_level;
							}
							classes[i].capacity = 17;
							classes[i].count = 0;
							
						}
						
					});
					
					//if (debugging) console.log('Stored classes:\n'+JSON.stringify(classes,null,4));
					
				}
		
				//Setup field sorting algorithm
				const fieldSorter = (fields) => (a, b) => fields.map(o => {
						
					let dir = 1;
					if (o[0] === '-') { dir = -1; o=o.substring(1); }
					return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
					
				}).reduce((p, n) => p ? p : n, 0);
		
				//Generate random seed for each student
				students.map((obj) => {
						
					obj.random = Math.random();
					return obj;
					
				});
				
				//if (debugging) console.log('Stored students:\n'+JSON.stringify(students,null,4));
		
				//Sort students by gender, language and pseudo-random seed
				const sortedStudents = students.sort(fieldSorter(['random', 'firstLanguage', 'gender']));
				
				//if (debugging) console.log('Sorted students:\n'+JSON.stringify(sortedStudents,null,4));
		
				//Cycle students in random order, set the next most available class and increment student count for that class
				sortedStudents.forEach(function(element) {
					var b = false;
					if (element.SECTION == "") {
						for (var index = 0; index < classes.length; ++index) {
							if (element.electiveChoicesInfo.indexOf('(' + pass + ') ' + classes[index].class_name.substring(0,14)) < 0 && classes[index].count < 17
								&& parseInt(element.level) >= parseInt(classes[index].min_level) && parseInt(element.level) <= parseInt(classes[index].max_level) ) {
								element.SECTION = classes[index].class_id;
								classes[index].count++;
								b = true;
								break;
							}
						}
					}

				});
		
			});
		}
		
		//if (debugging) console.log('Stored classes:\n'+JSON.stringify(classes,null,4));
		if (debugging) {
			
			classes.forEach(function(row) {
					
				console.log(JSON.stringify(row,null,4));
				
			});
			
		}		
		
		//Update student placement
		if (1==2) {
		students.forEach(function(row) {
				
			if (debugging) console.log('Updating row:\n'+JSON.stringify(row, null, 4));
			
			jq$.ajax({
					
				url:  
				 "https://"
				 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
				 + "/srs/currmgr/specialtyprogram/placement/sectionPlacementDashboard.do?method=processDataGridRequest",
				type: "POST",
				async: false,
				data: {
					
					id: row.id,
					outstandingBalanceInternal: "Save Columns",
					oper: "edit",
					dataGridAction: "update",
					SUBJECT_ID: row.SUBJECT_ID,
					SECTION: row.SECTION,
					versionNumber: row.versionNumber,
					
				},
				
				success:function(response) {
					
					++update_count;
					if (debugging) console.log('Update response:\n'+JSON.stringify(response,null,4));
					
				},
				
				error:function(msg){
					
					if (debugging) console.log('Update FAILED:\n'+JSON.stringify(msg,null,4));
					
				}
				
			});
			
		});
		}
        
        //Reload page and finish
        d1$.hideProgress();
        if (debugging) console.log('Finished, reloading page');
        if (update_count > 0) {
        	alert(update_count + ' record(s) updated');
        	//location.reload();
        }
        return true;
        
    }
})(jQuery);