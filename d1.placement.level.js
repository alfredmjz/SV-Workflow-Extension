/*!
  * SV-Functions
  * Licensed under MIT
  */
  
(function(jq$) {
		
	'use strict';
	//jq$ is jQuery
	//d1$ is a global object for common functions and variables
    var debugging = true;
    
    //Update list options
    jq$('select.ui-pg-selbox').append('<option role="option" value="250">250</option><option role="option" value="500">500</option>');    
    
    
    var ptypes = jq$('ul.placementType').text();
    if (/Placement by Subjects/.test(ptypes)) {
		//Add buttons to assign levels (all records or unassigned only)
		jq$('<div class="bootstrapiso">'
			+'<a class="btn btn-info text-white m-1 mt-3" id="goAssignAllLevel" name="goAssignAllLevel" '
			+'title="Assign students to a level based on test score(s)">'
			+'Assign Levels (All)</a>'
			+'<a class="btn btn-info text-white m-1 mt-3" id="goAssignUnassignedLevel" name="goAssignUnassignedLevel" '
			+'title="Assign unassigned students to a level based on test score(s)">'
			+'Assign Levels (Unassigned)</a>'
			+'</div>')
			.insertAfter("#batchEnrollStudentsSection");
			
		 //Create event triggers for each button
		jq$('#goAssignAllLevel').click(function(event) { d1_placement_level(true); });
		jq$('#goAssignUnassignedLevel').click(function(event) { d1_placement_level(false); });    	
    }

    //Establish relationship between exam proficiencies and levels
    //Assumption is that the test score is greater than or equal to the value attached to each level
    //If the record includes multiple matching exam proficiencies, the priority is taken from the order below 
    /*
    var profxlevel = {
    	    
	 "IELTS": {
	  "L3": 6.5, 
	  "L2": 6.0,
	  "L1": 5.5
	 },
	 
	 "TOEFLiBT": {
	  "L3": 80,
	  "L2": 72,
	  "L1": 65
	 },
	 
	 "GMAT": {
	  "L3": 700,
	  "L2": 600,
	  "L1": 500
	 }
	 
    };
    */

	var profxlevel = {
		
	 "IELTS": {
	  "AP9": 6.5,
	  "AP8": 6.0,
	  "AP7": 5.5,
	  "AP6": 5.0
	 },
	 
	 "CaMLA": {
	  "AP9": 81,
	  "AP8": 76,
	  "AP7": 70,
	  "AP6": 60,
	  "AP5": 50,
	  "AP4": 40,
	  "AP3": 30,
	  "AP2": 10,
	  "AP1": 0
	 },
	 
	 "WRITING": {
	  "AP9": 85,
	  "AP8": 75,
	  "AP7": 65,
	  "AP6": 55,
	  "AP5": 45,
	  "AP4": 35,
	  "AP3": 25,
	  "AP2": 0
	 }
	 
	};    
	
	//Return level for a particular exam proficiency and score from profxlevel
	function d1_calculate_level(prof, score) {
		
		var ovlevel = false;
		Reflect.ownKeys(profxlevel[prof]).forEach(function(level) {
	
			if (score >= profxlevel[prof][level]) {

				if (ovlevel === false) ovlevel = level;
				
			}
			
		});
		
		return ovlevel;
		
	}
	
	function d1_grid_date(string_date) {
	
		var array_date = string_date.split(" ");
		var array_month = { "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5, "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11 };  
		return new Date(array_date[2],array_month[array_date[1]],array_date[0]);
		
	}

	
	//Assign levels based on exam proficiencies
    function d1_placement_level(allrows) {
    	
        var rows = [];
    	var rowno = 1;
        var rowdata = {};
        var update_count = 0;
        
        //Confirm with user
        if (!confirm('Proceed with level assignment?')) return false;
        
        //Show progress bar
        d1$.showProgress();
        
        //Cycle cells in program offering placement grid and for each row create a key-value store (rows[n].key)
        jq$("#programOfferingPlacementGrid tr.jqgrow td").each(function() {
        		
            var fld = jq$(this).attr("aria-describedby").replace("programOfferingPlacementGrid_","");
            var val = jq$(this).text().trim();
            
            if (fld == "rn" && rowno != parseInt(val)) {
            	
                rowno = parseInt(val);
                rows[rows.length] = rowdata;
                rowdata = {};
                
            }
            
            rowdata[fld] = val;
            
        });
        
        rows[rows.length] = rowdata;
        
        if (debugging) console.log('Stored rows:\n'+JSON.stringify(rows,null,4));
        
        //Cycle rows
        rows.forEach(function(row) {
        		
        	var ovlevel = false;	//Keep track of overall level
        	
        	//Optional: Pull in external exam proficiency data
        	//Below is an example for retrieving questionnaire responses for the current student
        	/*
            jq$.ajax({
                url: 
                 "https://"
                 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
                 + "/srs/enrolmgr/student/applications/applicationInstance.do?method=editPageInstance"
                 + "&enrolmgrContextObjectId=" + row.studentId + "&businessObjectId=<insert-questionnaire-page-id>",
                type: "GET",
                async: false,
                success:function(response) {
                    if (debugging) console.log('Questionnaire Lookup:\n');
                    jq$("td.content input",response).each(function(index) {
                    	if (debugging) console.log(jq$(this).parent().text().trim() + ' = ' + jq$(this).val());
                    });
                },
                error:function(msg){
                    if (debugging) console.log("Questionnaire Lookup FAILED:\n"+JSON.stringify(msg,null,4));
                }
            });
            */
        	
        	//Skip rows that already have an overall level (if that option is selected)
        	if (allrows === false && d1$.isEmpty(row.OVERALL_LEVEL) === false) {
        		
        		return;
        		
        	}
        	
        	//Set continuing student overall level
        	jq$.ajaxSetup({async: false});
			jq$.getJSON(d1$.homeurl+'api/destiny/getStudentAcademicLevelP.php?studentId='+row.schoolPersonnelNumber, function (response) {
				if ('data' in response) {
					if ('level' in response.data) {
						ovlevel = "AP" + parseInt(response.data.level).toString();
						row["Academic Skills_level"] = ovlevel; 
						row.OVERALL_LEVEL = ovlevel;
						if (debugging) console.log('Set overall level by prior academic history: '+ovlevel+' ['+row.schoolPersonnelNumber+']');
					}
				}
			});
			jq$.ajaxSetup({async: true});
        		
        	//Cycle exam proficiencies
        	if (ovlevel == false || ovlevel == -1 || ovlevel == 'AP-1') {
        		var stop = false;
				Reflect.ownKeys(profxlevel).reverse().forEach(function(prof) {
					
					if (stop == false) {
						var prof_descr = prof;
						var tscore = 0;
						//Calculate level based on scale in profxlevel (only if a score is present)
						if (d1$.isEmpty(row["CaMLA_score"]) === false && d1$.isEmpty(row["WRITING_score"]) === false) {
							if (d1_grid_date(row["CaMLA_testDate"]) >= d1_grid_date(row["offeringStartDate"])) {
								tscore = ((parseFloat(row["CaMLA_score"]) * 2) + parseFloat(row["WRITING_score"])) / 3;
								ovlevel = d1_calculate_level("CaMLA",tscore);
								prof_descr = 'CaMLA/Writing';
							}
						
						} else if (d1$.isEmpty(row["IELTS_score"]) === false && d1$.isEmpty(row["IELTSW_score"]) === false) {
							
							tscore = row["IELTS_score"];
							ovlevel = d1_calculate_level("IELTS",tscore);
							prof_descr = 'IELTS/IELTSW';
							if (parseFloat(row["IELTSW_score"]) <= 4.5) {
								ovlevel = "AP5";	
							}
							
						} else if (d1$.isEmpty(row[prof+"_score"]) === false) {
							
							tscore = row[prof+"_score"];
							ovlevel = d1_calculate_level(prof,tscore);
							
						}
						
						//Update row with the corresponding overall level for this proficiency
						if (ovlevel !== false) {
							
							row["Academic Skills_level"] = ovlevel; 
							row.OVERALL_LEVEL = ovlevel;
							
							if (debugging) console.log('Set overall level by '+prof_descr+': '+ovlevel+' ['+tscore+'] ['+row.schoolPersonnelNumber+']');
							
							stop = true;
							
						}
					}
	
				});
			}
			
            //Optional: Apply custom rules and transformations here
            
            //Update data grid row
            row.outstandingBalanceInternal = "Save Columns";
            row.oper = "edit";
            row.dataGridAction = "update";
            
            //if (debugging) console.log('Updating row:\n'+JSON.stringify(row, null, 4));
            
            //Session-based authentication (needs to be executed by a signed in user with sufficient permissions)
            jq$.ajax({
            		
                url: 
                 "https://"
                 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
                 + "/srs/currmgr/specialtyprogram/placement/programOfferingPlacementDashboard.do?method=processDataGridRequest",
                type: "POST",
                async: false,
                data: row,
                success:function(response) {
                	
                	//console.log('Update response:\n'+JSON.stringify(response,null,4));
                	
                	if (response.status != 'error') {
                		
                		++update_count;
                		
                	}
                    
                },
                
                error:function(msg){
                	
                    console.log("Update FAILED:\n"+msg);
                    
                }
                
            });
            
            
        });
        
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