/*!
  * SV-Functions
  * Licensed under MIT
  */
  
//Common variables and functions
var d1$ = {
	
	//Use this hostname/port for all HTTP requests
	hostname: "",
	
	//Home URL
	homeurl: "https://continue.yorku.ca/",
	
	//Empty variable?
	isEmpty:function(str) {
		
		return (!str || 0 === str.length);
		
	},
	
	//Show progress overlay
	showProgress:function() {
		
		var mloader =
		'<div class="bootstrapiso" id="d1ProgressContainer">'
		+'<div class="modal fade" id="progressModal" data-backdrop="static" data-keyboard="false" role="dialog">'
			+'<div class="modal-dialog">'
				+'<div class="modal-content">'
					+'<div class="modal-header">'
						+'<h4 class="modal-title">In progress ...</h4>'
					+'</div>'
					+'<div class="modal-body">'
						+'<div class="progress">'
						  +'<div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" '
						  +'aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%; height: 40px">'
						  +'</div>'
						+'</div>'
					+'</div>'
				+'</div>'
			+'</div>'
		+'</div>'
		+'</div>';
		
		jQuery(document.body).append(mloader);
		jQuery("#progressModal").modal();
		jQuery("#d1ProgressContainer").hide().show(0);
		
	},
	
	//Hide progress overlay 
	hideProgress: function() {
		
		//jQuery("#progressModal").modal("hide");
		jQuery("#d1ProgressContainer").remove();
		
	}
	
};