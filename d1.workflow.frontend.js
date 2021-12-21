(function(jq$){
    'use strict';

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

    if(selected_option == 4){
        //Don't generate table for Dean's Office
    }
    else{
        //names holds two properties: assignee and wf_owner
        var names = mapAssignee(selected_option);

        jq$('[name="programOfficeId"]').closest('td').addClass("alignBar");
        jq$('[name="programOfficeId"]').closest('tr').append('<td id="flexcontainer"> <div id="flexbox">'
        + '<div class="user-flexchild"> </div>'
        + '<div class="assigned-flexchild"> </div>'
        + '</div></td>');

        jq$('.user-flexchild').append(
            '<ul id="user-list" class="content-list">'
            + '<li class="flex-first-row">User</li>'
            + '</ul>');

        jq$('.assigned-flexchild').append(
            '<ul id="assigned-list" class="content-list">'
            + '<li class="flex-first-row">Assignee</li>'
            + '</ul>');

        jq$('#flexcontainer').append(
            '<div id="button-wrapper">'
            +'<button type="button" id="applyAssign" class="yui3-button" onclick="" value="Apply">Apply</button>'
            +'<button type="button" id="applyReset" class="yui3-button" onclick="" value="Reset">Reset</button>'
            +'</div>');

        jq$.each(names.assignee, function(index, element){
            //Append list to table for availble users in the current PO/CU
            jq$('<li>', {
            class: 'flex-list-items list-user',
            value: index,
            text: element
            }).appendTo('#user-list');
        });

    }



        //Functions
        jq$('.flex-list-items').click(function(){
            //Move selected user to right of table
            if(jq$(this).hasClass('list-user')){
                jq$(this).appendTo('#assigned-list');
                jq$(this).addClass('list-assigned').removeClass('list-user');
            }

            //Move selected user to left of table
            else if(jq$(this).hasClass('list-assigned')){
                jq$(this).appendTo('#user-list');
                jq$(this).addClass('list-user').removeClass('list-assigned');
            }
        });


        function mapAssignee(program_office){
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
            //TODO: Sort value alphabetically
            var result = {};

            jq$(dropdown_selector).each(function(){
                result[parseInt(this.value)] = this.text;
            })

            return result;
        }

})(jQuery);