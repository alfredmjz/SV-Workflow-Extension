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
    	+'title="Assign all students to sections based on placement">'
    	+'Assign Sections</a>'
    	+'</div>')
    	.insertAfter("#batchEnrollStudents");

    //Update list options
    jq$('select.ui-pg-selbox').append('<option role="option" value="250">250</option><option role="option" value="500">500</option>');
    	
    //Create event trigger for button
    jq$('#goAssignSection').click(function(event) { d1_placement_section(); });

    
    //Assign section based on an equal gender and language mix
    function d1_placement_section () {
    	
        var students = [];
    	var rowno = 1;
        var rowdata = {};
        var update_count = 0;

        //Confirm with user
        if (!confirm('Proceed with section assignment??')) return false;
        
        //Show progress bar
        d1$.showProgress();
        
        //Cycle cells in section placement grid and for each row create a key-value store (students[n].key)
        jq$('table[id^=sectionPlacement][id$=Grid] tr.jqgrow td').each(function() {
        		
            var fld = jq$(this).attr("aria-describedby").replace("sectionPlacementGrid_","").replace("sectionPlacementRequiredGrid_","");
            var val = jq$(this).text().trim();
            
            if (fld == "rn" && rowno != parseInt(val)) {
            	
                rowno = parseInt(val);
                rowdata.updaterecord = false;
                students[students.length] = rowdata;
                rowdata = {};
                
            }
            
            rowdata[fld] = val;
            
        });
        rowdata.updaterecord = false;
        students[students.length] = rowdata;
        
        //Retrieve last instructor
        jq$.ajaxSetup({async: false});
        for (var index = 0; index < students.length; ++index) {
        	students[index].instructors = "";
			jq$.getJSON(d1$.homeurl+'api/destiny/getStudentInstructorListP.php?studentId='+students[index].schoolPersonnelNumber, function (response) {
				if ('data' in response) {
					if ('instructors' in response.data) {
						if (response.data.instructors != null) {
						students[index].instructors = response.data.instructors;
						console.log(students[index].instructors);
						}
					}
				}
			});
        }
        jq$.ajaxSetup({async: true});

        //Store list of classes
        var classes = [];
        var i = 0;
        jq$("#bulkPlacementSection option").each(function() {
        		
            i = classes.length;
            if (!d1$.isEmpty(jq$(this).text())) {
            	

            	
                classes[i] = {};
                classes[i].class_id = jq$(this).val();
                classes[i].class_name = jq$(this).text();
                classes[i].instructor = "";	
                classes[i].count = 0;
                
                jq$.ajaxSetup({async: false});
				jq$.getJSON(d1$.homeurl+'api/destiny/getSectionInstructorP.php?sectionId='+classes[i].class_id, function (response) {
					if (response['data']['instructor'] != null) {
						classes[i].instructor = response['data']['instructor'];
					}
					jq$.ajaxSetup({async: true});
				});
                
            }
            
        });
        
        if (debugging) console.log('Stored classes:\n'+JSON.stringify(classes,null,4));

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
        
        if (debugging) console.log('Stored students:\n'+JSON.stringify(students,null,4));

        //Sort students by gender, language and pseudo-random seed
        const sortedStudents = students.sort(fieldSorter(['gender', 'firstLanguage', 'random']));
        
        if (debugging) console.log('Sorted students:\n'+JSON.stringify(sortedStudents,null,4));

        sortedStudents.forEach(function(element) {
        	if (!d1$.isEmpty(element.section)) {
				for (var index = 0; index < classes.length; ++index) {				
					if (classes[index].class_id == element.section || classes[index].class_name == element.section) {
						classes[index].count++;
						break;
					}
				}
			}
        });
        
        //Cycle students in sorted order, set the next most available class and increment student count for that class
        sortedStudents.forEach(function(element) {
        	if (d1$.isEmpty(element.section)) {
				var b = false;
				for (var index = 0; index < classes.length; ++index) {
					
					if (d1$.isEmpty(element.instructors) || d1$.isEmpty(classes.sort(fieldSorter(['count', 'class_id']))[index].instructor) || element.instructors.indexOf(classes.sort(fieldSorter(['count', 'class_id']))[index].instructor) < 0) {
						element.SECTION = classes.sort(fieldSorter(['count', 'class_id']))[index].class_id;
						classes.sort(fieldSorter(['count', 'class_id']))[index].count++;
						element.updaterecord = true;
						b = true;
						break;
					}
				}
				if (b == false) {
					element.section = classes.sort(fieldSorter(['count', 'class_id']))[0].class_id;
					classes.sort(fieldSorter(['count', 'class_id']))[0].count++;
				}
			} else {
				if (debugging) console.log('Skipped student due to existing placement:\n'+element.schoolPersonnelNumber);
			}
        });

        if (debugging) {
        	
			classes.forEach(function(row) {
					
				console.log(JSON.stringify(row,null,4));
				
			});
			
		}
		
        //Update student placement
        if (1==1) {
        students.forEach(function(row) {
        	if (row.updaterecord == true) {
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
            }
        });
        }
        
        //Reload page and finish
        d1$.hideProgress();
        if (debugging) console.log('Finished, reloading page');
        if (update_count > 0) {
        	alert(update_count + ' record(s) updated');
        	location.reload();
        }
        return true;
        
    }
})(jQuery);