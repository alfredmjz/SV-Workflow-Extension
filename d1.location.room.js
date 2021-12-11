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
		"method" : "create",
		"preMethod" : "create",
		"methodOfRoomConfiguration" : "addConfiguration",
		"i18nEntityId" : "0",
		"i18nEntityName" : "",
		"businessObjectId" : "",
		"roomConfigId" : "",
		"roomConfigName" : "",
		"isPageDisplayed" : "true",
		"protectedFields" : "room.code",
		"fieldOnFocus" : "room.name",
		"room.code" : "",
		"room.name" : "",	//Rm 019A
		"campusId" : "",		//17745 (Keele Campus on Test)
		"buildingId" : "",		//17747
		"room.objectStatus" : "active",
		"roomMaxStudents" : "",	//17
		"room.externalRoomId" : "",
		"roomConfiguration.name" : "",
		"roomConfigurationMaxStudents" : "",
		"room.description" : "",
		"room.comments" : "",
		"room.surname" : "",
		"room.firstName1" : "",
		"salutationCode" : "",
		"telephoneTypeCode" : "",
		"room.codeArea" : "",
		"room.telephoneNumber" : "",
		"room.telephoneExt" : "",
		"room.emailAddress" : ""
	}

	
    //Add buttons to import/export/clear list item(s)
    jq$('<div class="bootstrapiso">'
    	+'<h3>Import/Export</h3><br />'
    	+'<p>To import, upload CSV file with columns in the following order: FY, Term Name, Term Code, Start Date, End Date </p>'
    	+'<div class="ml-1 mt-2"><input type="file" name="File Upload" id="d1FileUpload" accept=".csv" /></div><br />'
    	+'<a class="btn btn-info text-white m-1 mt-1 disabled d1FileUploadBtn" id="d1AddPrefFromCsv" name="d1AddPrefFromCsv" '
    	+'title="Add to the existing list with the values contained in the import file" aria-disabled="true">'
    	+'Add from CSV</a>'
    	+'<a class="btn btn-info text-white m-1 mt-1 disabled d1FileUploadBtn" id="d1ReplacePrefFromCsv" name="d1ReplacePrefFromCsv" '
    	+'title="Replace the existing list with the values contained in the import file" aria-disabled="true">'
    	+'Replace from CSV</a>'
    	+'<a class="btn btn-danger text-white m-1 mt-1" id="d1ClearList" name="d1ClearList" '
    	+'title="Clear existing list (delete all items)" >'
    	+'Clear Table </a>'
    	+'<a class="btn btn-success text-white m-1 mt-1" id="d1ExportList" name="d1ExportList" '
    	+'title="Export the existing list" >'
    	+'Export to CSV </a>'
    	+'</div>'
    ).insertBefore("div #activeRoom");


    //Parse date from format MMM/dd/yyyy
    function d1_parse_date(datestring) {
    	var monthlist = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    	var datecomp = datestring.split('/');
    	return new Date(datecomp[2], monthlist[datecomp[0].toLowerCase()], datecomp[1]);
    }


    //Return true if HTML5 file upload method is supported
	function d1_file_upload_supported() {

		var isSupported = false;

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			
			isSupported = true;
			
		}

		return isSupported;

	}

	
	//Return maximum index value for the current list
	function d1_list_max_index () {
		
		var maximum = 0;

		$('input[name=defaultCodeIndex]').each(function() {
			var value = parseInt($(this).val());
			maximum = (value > maximum) ? value : maximum;
		});	
		
		return maximum;
		
	}
	
	
	//Execute action against dynamiclist.do endpoint
	function d1_list_action (postData) {
		
		return jq$.ajax({
				
			type: "POST",
			async: false,
			url: 'https://'
			 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
			 + '/srs/currmgr/location/room.do',		
			data: postData,

			success:function(response) {

				if (debugging) console.log('List action response:\n'+JSON.stringify(response,null,4));
				return true;

			},

			error:function(msg){

				if (debugging) console.log('List action FAILED:\n'+JSON.stringify(msg,null,4));
				return false;

			}

		});
		
	}
	
	
	//Refresh list view 
	function d1_list_refresh () {
		
		//Determine preference table
    	//var listType = jQuery("select[name=listTypeCode] option[selected=selected]").val();
    	
		//Setup post data
		var postData = Object.assign({}, postTemplate);
		postData.method = "loadCreate";
		
		//Call endpoint to load list into session
		if (!d1_list_action(postData)) return false;
		
		//Return
		return true;
		
	}
	
	
    //Delete all item(s) from the current list
    function d1_list_clear (reload) {
    	
    	//Determine max index and list
    	var indexMax = d1_list_index();
    	//var listType = jQuery("select[name=listTypeCode] option[selected=selected]").val();
    	
    	//Cycle list item(s) descending by index
		for(var i = indexMax; i >= 0; i--){
			
			//Setup post data
			var postData = Object.assign({}, postTemplate);
			postData.method = "remove";
			postData.codeIndex = i;
			postData.listTypeCode = listType;
			
			//Call endpoint to remove this item
			if (!d1_list_action(postData)) return false;

		}
		
		//Return
		if (reload) location.reload(true);
		return true;
		
    }

    
    //Import item(s) from CSV input file to the current list
    function d1_list_import () {
		
    	//Determine preference table
    	//https://yorktestsv.destinysolutions.com/srs/locationServlet
    	//locationType: building
    	//formName: roomForm
    	//parentId: 17745
    	/*
    	var fiscal_year = [];
    	jq$("select[name='academicYear.selectedOption'] option").each(function(fy) {
    		if (this.text != "") fiscal_year[this.text] = this.value;
    	});
    	*/

    	//Cycle input file row(s)
		for (var i = rowStart; i < data.length; i++) {
			
			//Setup post data
			var postData = Object.assign({}, postTemplate);
			postData.method = "create";
			postData.campusId = data[i][0];
			postData.buildingId = data[i][1];
			postData["room.name"] = data[i][2];
			postData["room.objectStatus"] = "active";
			postData.roomMaxStudents = data[i][3];
			
			if (debugging) console.log('Row Data:\n'+JSON.stringify(postData,null,4));
			
			//Call endpoint to create this item
			d1_list_action(postData);	

		}
		
		//Return
		//location.reload(true);
    	return true;
    	
    }
    
    
    //Export item(s) from the current list to CSV
    function d1_list_export () {
    	
    	//Initialize array for intermediate storage
    	var exportData = [];
    	var exportRow = 0;
    	var exportFlag = false;
    	
    	//Cycle cells in list structure
    	jq$("#tableItems tr.tableDataRow td").each(function() {
    		
    		var txt = jq$(this).text().trim();
    		
    		//Code
    		if (jq$(this).hasClass("tableDataTagCol1")) {
    			exportFlag = true;
    			exportData[exportRow] = [];
    			exportData[exportRow][0] = txt;
    			
    		//Label (if applicable)
    		} else if (jq$(this).hasClass("tableDataTagCol2") && txt != '&nbsp;' && txt != '') {
    			
    			exportFlag = true;
    			exportData[exportRow][1] = txt;
    		
    		//End of row
    		} else if (exportFlag == true && jq$(this).hasClass("goldTableCell")) {
    			
    			exportRow++;
    			exportFlag = false;
    			
    		}
    		
    	});
    	
    	
    	//Encode CSV content and prompt for download
    	var csvContent = jq$.csv.fromArrays(exportData);
    	var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    	window.open(encodedUri);
    	
    	//Return
    	return true;
    	
    }
    
    
    //Create event listener for Clear button
    jq$('#d1ClearList').click(function(event) { 
    		
    	if (!confirm('Clear this list? (All items will be deleted)')) return false;
    	
        d1$.showProgress();
        d1_list_refresh();
    	d1_list_clear(true);	//Reload = true
    	d1$.hideProgress();
    	
	});
	
	
	//Create event listener for Export button
    jq$('#d1ExportList').click(function(event) {
    		
    	d1_list_export();
    	
	});
	
	
    //Create event listener for file upload button
    jq$(document).ready(function() {
    		
    	//On file upload: 
		document.getElementById('d1FileUpload').addEventListener('change', d1_file_upload, false);
		function d1_file_upload(upload_event) {
			
			//Validate browser support
			if (!d1_file_upload_supported()) {

				if (debugging) console.log('HTML5 file APIs not supported!');

			//Supported browser:
			} else {

				//Read input file
				var inputFile = upload_event.target.files[0];
				var readFile = new FileReader();
				readFile.readAsText(inputFile);

				//Valid input file:
				readFile.onload = function(read_event) {

					//Convert CSV data to multidimensional array
					var dataCsv = read_event.target.result;
					data = jq$.csv.toArrays(dataCsv);

					//File not empty:
					if (data && data.length > 0) {
						
						//Store row count
						rowCount = data.length;
						if (debugging) console.log(rowCount + ' rows imported!');
						if (debugging) console.log('Row Data:\n'+JSON.stringify(data,null,4));
						
						//Create import preview string
						var dataPreview = '';
						for (var i = 0; i < data.length && i < 4; i++) {
							for (var j = 0; j < data[i].length; j++) {
								dataPreview += data[i][j];
								dataPreview += (j == data[i].length - 1) ? '\n' : ',';
							}
						}

						//Confirm column headers
						if (confirm('Click OK if the first row contains column headers, otherwise Cancel\n\nPreview:\n' + dataPreview)) rowStart = 1;

						//Enable Add/Replace import buttons
						jq$(".d1FileUploadBtn").removeClass('disabled').removeAttr('aria-disabled');
						
						//Create event listener for Add button
						jq$('#d1AddPrefFromCsv').click(function(event) {
								
							d1$.showProgress();
							
							//Confirm with user
						    if (!confirm('Add ' + (rowCount-rowStart) + ' rows from CSV input file to this list?\n\nNOTE: This procedure can take some time, depending on the number of rows.  Please wait until the page reloads.')) {
								d1$.hideProgress();
								return false;						    	
						    }
						    
						    //Import item(s) from CSV
						    d1_list_import();
						    
						    d1$.hideProgress();
						    
						});

						//Create event listener for Replace button
						jq$('#d1ReplacePrefFromCsv').click(function(event) {
								
							d1$.showProgress();
							
							//Confirm with user
							d1_list_refresh();
							if (!confirm('Replace this list with ' + (rowCount-rowStart) + ' rows from CSV input file?\n\nNOTE: This procedure can take some time, depending on the number of rows.  Please wait until the page reloads.')) {
								d1$.hideProgress();
								return false;
							}
							
							//Clear existing list and import item(s) from CSV
							if (d1_list_clear(false)) {
								d1_list_refresh();
								d1_list_import();
							}
							
							d1$.hideProgress();
							
						});


					} else {
						
						if (debugging) console.log('Nothing to import!');
						
					}

				};

				readFile.onerror = function() {
					
					if (debugging) console.log('Input file (' + inputFile.fileName + ') unreadable!');
					
				};

			}

		}

    });

})(jQuery);