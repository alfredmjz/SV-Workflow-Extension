(function(jq$){
    jq$(document).ready(function(){
        //Array of Program Office
        var program_office_selector = jq$('[name="programOfficeId"] option');
        var program_office = mapFromDropdown(program_office_selector);

        //Convert String type to number
        var selected_option = parseInt(jq$('[name="programOfficeId"] option:selected').val());
        const no_cu = [5, 4, 1];

        //True if current Program Office have a costing unit
        //Indexes of non costing units are: [5,4,1]
        if(jq$.inArray(selected_option, no_cu) === -1){
            var cu_selector = jq$('[name="costingUnitId"] option');
            var cu_map = mapFromDropdown(cu_selector);
        }

        //names holds two properties: assignee and wf_owner
        var names = listUser(selected_option);

        //Functions
        function listUser(program_office){
            var assignee_selector = null;
            var wf_owner_selector = null;


            if(program_office == 5){
                assignee_selector = jq$('[name="taskAssigneesInfo[0].selectedAssignee[2]"] option');
            }

            //These program office have same html tag names
            else if(program_office == 18153 || program_office == 18356){
                var selected_cu = parseInt(jq$('[name="costingUnitId"] option:selected').val());

                //value of first costing unit if exist is NaN
                if(isNaN(selected_cu)){
                    assignee_selector = jq$('[name="taskAssigneesInfo[16].selectedAssignee[1]"] option');
                    wf_owner_selector = jq$('[name="processOverseer[16]"] option');
                }
                else{
                    assignee_selector = jq$('[name="taskAssigneesInfo[0].selectedAssignee[1]"] option');
                    wf_owner_selector = jq$('[name="processOverseer[0]"] option');
                }
            }

            else if(program_office == 4){
                assignee_selector = jq$('[name="costingUnitDirectors[0]"] option');
            }

            else if(program_office == 3){
                assignee_selector = jq$('[name="taskAssigneesInfo[0].selectedAssignee[1]"] option');
                wf_owner_selector = jq$('[name="processOverseer[0]"] option');
            }

            else if(program_office == 2){
                assignee_selector = jq$('[name="taskAssigneesInfo[1].selectedAssignee[1]"] option');
                wf_owner_selector = jq$('[name="processOverseer[2]"] option');
            }

            else if(program_office == 1){
                assignee_selector = jq$('[name="taskAssigneesInfo[50].selectedAssignee[1]"] option');
                wf_owner_selector = jq$('[name="processOverseer[50]"] option');
            }

            var assignee = mapFromDropdown(assignee_selector);
            var wf_owner = mapFromDropdown(wf_owner_selector);


            return {"assignee": assignee, "wf_owner" : wf_owner};
        }


        function mapFromDropdown(dropdown_selector){
            var result = {};

            jq$(dropdown_selector).each(function(){
                result[parseInt(this.value)] = this.text;
            })

            return result;
        }
    })
})(jQuery);