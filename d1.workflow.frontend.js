(function(jq$){
    'use strict';
    //Array of Program Office
    var program_office_selector = jq$('[name="programOfficeId"] option');
    var program_office = mapFromElement(program_office_selector);

    //Convert String type to number
    var selected_option = parseInt(jq$('[name="programOfficeId"] option:selected').val());
    const no_cu = [5, 4, 1];

    //True if current Program Office have a costing unit
    //Indexes of non costing units are: [5,4,1]
    if(jq$.inArray(selected_option, no_cu) === -1){
        var cu_selector = jq$('[name="costingUnitId"] option');
        var cu_map = mapFromElement(cu_selector);
    }

    if(selected_option == 4){
        //Don't generate table for Dean's Office
    }
    else{
        //names holds two properties: assignee and wf_owner
        var names = mapAssignee(selected_option);

        //Creating Table view
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
            +'<button type="button" id="applyAssign" class="yui3-button">Assign All</button>'
            +'<button type="button" id="applyClear" class="yui3-button">Clear</button>'
            +'</div>');

        //Append list to table for availble users in the current PO/CU
        addNameList("default");
    }

    //Create checkboxes for each event
    var officeName = jq$("table").find(":selected").attr("value");
    var applicableOffice = ["18153", "18356", "21453563"];
    var value = jq$(".fullWidthTable")
            .find("tr:even")
            .not(":first")
            .children(":first")
            .text();
    if (applicableOffice.includes(officeName)) {
        jq$(".fullWidthTable").each(function () {
            jq$('<td class="goldTableTitle">Select</td>').prependTo(
            jq$(this).find("tr").eq(1)
        );


        jq$(
            '<td class="goldTableCell" valign="top">' +
            '<input type="checkbox" name="event" style="margin:0">' +
            "</td>"
        ).prependTo(jq$(this).find("tr:even").not(":first"));
        });
    }

    var all_checked = [];   //Contains values of only checked box
    jq$('.goldTableCell [name="event"]').change(function() {
        if(jq$(this).is(":checked")) {
            all_checked.push(value);
        }
        else{
            all_checked.splice(all_checked.indexOf(value), 1);
        }
        console.log(all_checked);
    });



        //Functions
        var pos;

        jq$('.flex-list-items').click(function(){
            //Move selected user to right of table
            pos = findPos(names.assignee, jq$(this).text());
            if(jq$(this).hasClass('list-user')){
                jq$(this).replaceWith('');
                jq$('#assigned-list > li:eq(' + pos + ')').replaceWith(this);
                jq$(this).addClass('list-assigned').removeClass('list-user');
            }

            //Move selected user to left of table
            else if(jq$(this).hasClass('list-assigned')){
                jq$(this).replaceWith('');
                jq$('#user-list > li:eq(' + pos + ')').replaceWith(this);
                jq$(this).addClass('list-user').removeClass('list-assigned');
            }
        });

        jq$("#applyAssign").click(function(){
            jq$(".list-user").remove();
            jq$(".list-assigned").remove();
            addNameList("assign");
        });

        jq$("#applyClear").click(function(){
            jq$(".list-user").remove();
            jq$(".list-assigned").remove();
            addNameList("default");
        });

        //default = all names on left of table
        //assign = all names on right of table
        function addNameList(mode){
            if(mode == "default"){
                jq$.each(names.assignee, function(name, id){
                    jq$('<li>', {
                    class: 'flex-list-items list-user',
                    value: id,
                    text: name,
                    }).appendTo('#user-list');
                });
                jq$.each(names.assignee, function(){
                    jq$('<li>', {
                    class: 'flex-list-items list-assigned',
                    value: "",
                    text: "",
                    }).appendTo('#assigned-list');
                });
            }

            else if(mode == "assign"){
                    jq$.each(names.assignee, function(){
                        jq$('<li>', {
                        class: 'flex-list-items list-user',
                        value: '',
                        text: '',
                        }).appendTo('#user-list');
                    });
                    jq$.each(names.assignee, function(name, id){
                        jq$('<li>', {
                        class: 'flex-list-items list-assigned',
                        value: id,
                        text: name,
                        }).appendTo('#assigned-list');
                });
            }
        }

        //Find index of keys from dictionary
        function findPos(dict, target){
            var index = 1; //Dictionary starts with '' as index 0 but is not visible in list
            for(var name in dict){
                if(name == target){
                    break;
                }
                ++index;
            }
            return index;
        }

        function mapAssignee(program_office){
            var assignee_selector = null;
            var wf_owner_selector = null;

            if(program_office == 5){
                assignee_selector = jq$('[name="taskAssigneesInfo[0].selectedAssignee[2]"] option');
            }

            //These program office have the same html tag names
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

            var assignee = mapFromElement(assignee_selector);
            var wf_owner = mapFromElement(wf_owner_selector);


            return {"assignee": assignee, "wf_owner" : wf_owner};
        }



        function mapFromElement(HTML_selector){
            var result = {};

            jq$(HTML_selector).each(function(){
                result[this.text] = this.value;
            })
            return result;
        }

})(jQuery);

