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

	
    //Add buttons to import/export/clear preference table item(s)
    jq$('<div class="bootstrapiso">'
    	+'<h3>Import/Export</h3><br />'
    	+'<p>To import, upload CSV file with "Code" values in first column and "Label" values in second column (if applicable).</p>'
    	+'<div class="ml-1 mt-2"><input type="file" name="File Upload" id="d1FileUpload" accept=".csv" /></div><br />'
    	+'<a class="btn btn-info text-white m-1 mt-1 disabled d1FileUploadBtn" id="d1AddPrefFromCsv" name="d1AddPrefFromCsv" '
    	+'title="Add to the existing preference table with the values contained in the import file" aria-disabled="true">'
    	+'Add from CSV</a>'
    	+'<a class="btn btn-info text-white m-1 mt-1 disabled d1FileUploadBtn" id="d1ReplacePrefFromCsv" name="d1ReplacePrefFromCsv" '
    	+'title="Replace the existing preference table with the values contained in the import file" aria-disabled="true">'
    	+'Replace from CSV</a>'
    	+'<a class="btn btn-danger text-white m-1 mt-1" id="d1ClearList" name="d1ClearList" '
    	+'title="Clear existing preference table (delete all items)" >'
    	+'Clear Table </a>'
    	+'<a class="btn btn-success text-white m-1 mt-1" id="d1ExportList" name="d1ExportList" '
    	+'title="Export the existing preference table" >'
    	+'Export to CSV </a>'
    	+'</div>'
    ).insertAfter("div.auditInfoPaddingFromContent");


    //Return true if HTML5 file upload method is supported
	function d1_file_upload_supported() {

		var isSupported = false;

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			
			isSupported = true;
			
		}

		return isSupported;

	}

	
	//Return maximum index value for the currently selected preference table
	function d1_preference_max_index () {
		
		var maximum = 0;

		$('input[name=defaultCodeIndex]').each(function() {
			var value = parseInt($(this).val());
			maximum = (value > maximum) ? value : maximum;
		});	
		
		return maximum;
		
	}
	
	
	//Execute action against dynamiclist.do endpoint
	function d1_preference_action (postData) {
		
		return jq$.ajax({
				
			type: "POST",
			async: false,
			url: 'https://'
			 + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
			 + '/srs/sysadmin/system/dynamicList.do',		
			data: postData,

			success:function(response) {

				if (debugging) console.log('Preference table action response:\n'+JSON.stringify(response,null,4));
				return true;

			},

			error:function(msg){

				if (debugging) console.log('Preference table action FAILED:\n'+JSON.stringify(msg,null,4));
				return false;

			}

		});
		
	}
	
	
	//Refresh preference table view 
	function d1_preference_refresh () {
		
		//Determine preference table
    	var listType = jQuery("select[name=listTypeCode] option[selected=selected]").val();
    	
		//Setup post data
		var postData = Object.assign({}, postTemplate);
		postData.method = "edit";
		postData.listTypeCode = listType;
		
		//Call endpoint to load preference table into session
		if (!d1_preference_action(postData)) return false;
		
		//Return
		return true;
		
	}
	
	
    //Delete all item(s) from the currently selected preference table
    function d1_preference_clear (reload) {
    	
    	//Determine max index and preference table
    	var indexMax = d1_preference_max_index();
    	var listType = jQuery("select[name=listTypeCode] option[selected=selected]").val();
    	
    	//Cycle preference table item(s) descending by index
		for(var i = indexMax; i >= 0; i--){
			
			//Setup post data
			var postData = Object.assign({}, postTemplate);
			postData.method = "remove";
			postData.codeIndex = i;
			postData.listTypeCode = listType;
			
			//Call endpoint to remove this item
			if (!d1_preference_action(postData)) return false;

		}
		
		//Return
		if (reload) location.reload(true);
		return true;
		
    }

    
    //Import item(s) from CSV input file to the currently selected preference table 
    function d1_preference_import () {
		
    	//Determine preference table
    	var listType = jQuery("select[name=listTypeCode] option[selected=selected]").val();
    	
    	//Cycle input file row(s)
		for (var i = rowStart; i < data.length; i++) {
			
			//Setup post data
			var postData = Object.assign({}, postTemplate);
			postData.method = "save";
			postData.listTypeCode = listType;
			postData.code = data[i][0];
			if(data[0][1] == 'label') postData.label = data[i][1];
			
			//Call endpoint to create this item
			d1_preference_action(postData);	

		}
		
		//Return
		location.reload(true);
    	return true;
    	
    }
    
    
    //Export item(s) from the currently selected preference table to CSV
    function d1_preference_export () {
    	
    	//Initialize array for intermediate storage
    	var exportData = [];
    	var exportRow = 0;
    	var exportFlag = false;
    	
    	//Cycle cells in preference table structure
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
    		
    	if (!confirm('Clear this preference table? (All items will be deleted)')) return false;
    	
        d1$.showProgress();
        d1_preference_refresh();
    	d1_preference_clear(true);	//Reload = true
    	d1$.hideProgress();
    	
	});
	
	
	//Create event listener for Export button
    jq$('#d1ExportList').click(function(event) {
    		
    	d1_preference_export();
    	
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
						    if (!confirm('Add ' + (rowCount-rowStart) + ' rows from CSV input file to this preference table?\n\nNOTE: This procedure can take some time, depending on the number of rows.  Please wait until the page reloads.')) {
								d1$.hideProgress();
								return false;						    	
						    }
						    
						    //Import item(s) from CSV
						    d1_preference_import();
						    
						    d1$.hideProgress();
						    
						});

						//Create event listener for Replace button
						jq$('#d1ReplacePrefFromCsv').click(function(event) {
								
							d1$.showProgress();
							
							//Confirm with user
							d1_preference_refresh();
							if (!confirm('Replace this preference table with ' + (rowCount-rowStart) + ' rows from CSV input file?\n\nNOTE: This procedure can take some time, depending on the number of rows.  Please wait until the page reloads.')) {
								d1$.hideProgress();
								return false;
							}
							
							//Clear existing list and import item(s) from CSV
							if (d1_preference_clear(false)) {
								d1_preference_refresh();
								d1_preference_import();
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