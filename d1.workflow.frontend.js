
(function(jq$){
	'use strict';
	//jq$ is jQuery
	//d1$ is a global object for common functions and variables
    var debugging = false;


    //Convert String type to number
    var selected_office = parseInt(jq$('[name="programOfficeId"] option:selected').val());
    const no_cu = [5, 4, 1];

    //True if current Program Office have a costing unit
    //Indexes of non costing units are: [5,4,1]
    if(jq$.inArray(selected_office, no_cu) === -1){
        var selected_cu = parseInt(jq$('[name="costingUnitId"] option:selected').val()); //Selected CU
    }

    if(selected_office == 4){
        //Don't generate table for Dean's Office
    }
    else{
        //names holds two properties: assignee and wf_owner
        var names = mapAssignee(selected_office, selected_cu);

        //Creating Table view
        //jq$('[name="programOfficeId"]').closest('td').addClass("alignBar");
        jq$('[name="programOfficeId"]').closest('tr').append('<td id="flexcontainer">'
        + '<div id="changeAssignment"> <div id="button-wrapper">'
        + '<button type="button" id="assigneeList" class="yui3-button"> Assignee </button>'
        + '<button type="button" id="wfOwnerList" class="yui3-button"> Workflow Owner </button> </div></div>'

        + '<div id="flexbox">'
        + '<div class="user-flexchild"> </div>'
        + '<div class="assigned-flexchild"> </div>'
        + '</div></td>');

        jq$('.user-flexchild').append(
            '<ul id="user-list" class="content-list">'
            + '<li class="flex-first-row">Name</li>'
            + '</ul>');

        jq$('.assigned-flexchild').append(
            '<ul id="assigned-list" class="content-list">'
            + '<li class="flex-first-row">Assignee</li>'
            + '</ul>');

        jq$('#flexcontainer').append(
            '<div id="button-wrapper">'
            +'<button type="button" id="moveAllLeft" class="yui3-button"><<</button>'
            +'<button type="button" id="applySubmit" class="yui3-button">Submit</button>'
            +'<button type="button" id="moveAllRight" class="yui3-button">>></button>'
            +'</div>');

        //Append list to table for availble users in the current PO/CU
        addNameList("default", names.assignee);
    }

    //Create checkboxes for each event
    var officeName = jq$("table").find(":selected").attr("value");
    var applicableOffice = ["18153", "18356", "21453563"];

    if (applicableOffice.includes(officeName)) {

        jq$(".fullWidthTable").each(function () {
                //Insert Select Title
                jq$('<td class="goldTableTitle"> Select </td>').prependTo(jq$(this).find("tr").eq(1));

                //Insert Checkbox
                jq$('<td class="goldTableCell" valign="top">'
                +'<input type="checkbox" name="event" style="margin:0">'
                +"</td>").prependTo(jq$(this).find("tr").filter( ":nth-child(2n + 3)"));
        });
    }

    var tableName = null;
    var extract_col = null;
    var tableID = [];
    var taskAssigneesInfo;
    var selectedAssignee;
    jq$('.goldTableCell [name="event"]').change(function() {
        if(jq$(this).is(":checked")) {
            //Get ID of checked tables
            tableName = jq$(this).closest("table.fullWidthTable tr");
            extract_col = jq$(tableName).find(".goldTableCell:eq(4) .smallMarginWrapper select").attr("name");
            taskAssigneesInfo = parseInt(extract_col.substring(extract_col.indexOf('[') + 1, extract_col.indexOf(']')));
            selectedAssignee = parseInt(extract_col.substring(extract_col.lastIndexOf('[') + 1, extract_col.lastIndexOf(']')));
            if (!tableID[taskAssigneesInfo]) {
                tableID[taskAssigneesInfo] = [];
            }
            tableID[taskAssigneesInfo].push(selectedAssignee);
        }
        else{
            tableID[taskAssigneesInfo].pop(selectedAssignee);
        }
    });




            /*********Functions**********/

            var pos;
            //".on" function delegate previous DOM objects to its current modified version (can't use .click)
            jq$('.content-list').on("click",".flex-list-items", function(){
                //Move selected user to right of table
                pos = findPos(names.assignee, jq$(this).text());

                if(jq$(this).hasClass('list-user')){
                    jq$(this).replaceWith("<li class='flex-list-items list-user'></li>");
                    jq$('#assigned-list > li:eq(' + pos + ')').replaceWith(this);
                    jq$(this).addClass('list-assigned').removeClass('list-user');
                }

                //Move selected user to left of table
                else if(jq$(this).hasClass('list-assigned')){
                    jq$(this).replaceWith("<li class='flex-list-items list-assigned'></li>");
                    jq$('#user-list > li:eq(' + pos + ')').replaceWith(this);
                    jq$(this).addClass('list-user').removeClass('list-assigned');
                }
            });

            //Insert scroll up button
            jq$('<button id="scrollTop">↑</button>').insertAfter("h1");
            jq$("#scrollTop").click(function (e) {
                jq$("html, body").animate({
                    scrollTop: jq$("h1"),
                });
                return false;
            });






            //Bulk Control Buttons
            // 0 : Assignee List
            // 1 : Workflow Owner List
            var status = [true, false];
            jq$('#button-wrapper').click(function(e){
                jq$(".list-user").remove();
                jq$(".list-assigned").remove();

                var event = jq$(e.target);
                if(event.is("#assigneeList")){
                    jq$("#user-list .flex-first-row").text("Name");
                    jq$("#assigned-list .flex-first-row").text("Assignee");
                    status[0] = true
                    status[1] = false
                    addNameList("default", names.assignee);
                }

                else if(event.is("#wfOwnerList")){
                    jq$("#user-list .flex-first-row").text("Workflow Owner");
                    jq$("#assigned-list .flex-first-row").text("Event");
                    status[0] = false
                    status[1] = true
                    addNameList("default", names.wf_owner);
                }
            });



            jq$('#moveAllLeft').click(function(){
                jq$(".list-user").remove();
                jq$(".list-assigned").remove();
                if(status[0] == true){
                    addNameList("default", names.assignee);
                }
                else if(status[1] == true){
                    addNameList("default", names.wf_owner);
                }
            });

            jq$('#moveAllRight').click(function(){
                jq$(".list-user").remove();
                jq$(".list-assigned").remove();
                if(status[0] == true){
                    addNameList("assign", names.assignee);
                }
                else if(status[1] == true){
                    addNameList("assign", names.wf_owner);
                }
            });


            jq$("#applySubmit").click(function(){
                var finalized_name = mapFromElement(jq$('.list-assigned'));
                if(status[0] == true){
                    postAssignee(finalized_name, tableID, selected_office, selected_cu);
                }
                else if(status[1] == true){
                    //TODO: collect overseer events, change table view when clicked on button
                    postOverseer(finalized_name, tableID, selected_office, selected_cu);
                }
                window.location.reload();
            });










    /*********Functions**********/
    function postAssignee(nameList, eventID, program_office, costing_unit){
        if(isNaN(costing_unit)){
            costing_unit = "";
        }

        //Static data
        var postData = {
            method: 'addTaskAssignee',
            programOfficeId: program_office,
            displayPage: false,
            costingUnitId: costing_unit,
            roleId: 0,
        };

        var saveData = {
            method: "update",
            programOfficeId: selected_office,
            displayPage: false,
            costingUnitId: selected_cu,
            processIndex: 0,
            taskIndex: 0,
            roleId: 0,
            taskAssigneeId: 0,
        };

        //Dynamic data
        var eventIndex;
        jq$.each(nameList, function(name, id){
            for (var key = 0; key < eventID.length; key++) {
                postData['processIndex'] = key
                for(var value = 0; value < eventID[key].length; value++){
                    eventIndex = eventID[key][value];
                    postData['taskIndex'] = eventIndex
                    postData['taskAssigneeId'] = id;
                    postData['taskAssigneesInfo[' + key + '].selectedRole[' + eventIndex + ']'] = "";
                    postData['taskAssigneesInfo[' + key + '].selectedAssignee[' + eventIndex + ']'] = id;
                    postData['taskAssigneesInfo[' + key + '].ccMail[' + eventIndex + ']'] = "";

                    jq$.ajax({
                        type: "POST",
                        async: false,
                        data: postData,
                        url: 'https://'
                        + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
                        +'/srs/sysadmin/system/programOfficeTaskSetup.do?',

                        success : function(data) {
                            if(debugging) console.log('Data: '+ data);
                        },
                        error : function(msg)
                        {
                            if(debugging) console.log("Update FAILED: "+ msg);
                        }
                    });
                }
            }
        });

        //Save data after adding users
        jq$.ajax({
            type: "POST",
            async: false,
            data: saveData,
            url: 'https://'
            + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
            +'/srs/sysadmin/system/programOfficeTaskSetup.do?',

            success : function(data) {
                if(debugging) console.log('Data: '+ data);
            },
            error : function(msg)
            {
                if(debugging) console.log("Update FAILED: "+ msg);
            }
        });
    }

    function postOverseer(overseer_name, eventID, program_office, costing_unit){
        if(isNaN(costing_unit)){
            costing_unit = "";
        }

        //Static data
        var postData = {
            method: 'update',
            programOfficeId: program_office,
            displayPage: false,
            costingUnitId: costing_unit,
            roleId: 0,
        };

        //Only 1 name for process overseer
        for (var key = 0; key < eventID.length; key++) {
            postData['processOverseer[' + key + ']'] = overseer_name;
        }

        jq$.ajax({
            type: "POST",
            async: false,
            data: postData,
            url: 'https://'
            + ((d1$.isEmpty(d1$.hostname)) ? window.location.hostname : d1$.hostname)
            +'/srs/sysadmin/system/programOfficeTaskSetup.do?',

            success : function(data) {
                if(debugging) console.log('Data: '+ data);
            },
            error : function(msg)
            {
                if(debugging) console.log("Update FAILED: "+ msg);
            }
        });
    }


    //default = push all names to left of table
    //assign = push all names to right of table
    function addNameList(mode, nameList){
        if(mode == "default" && nameList == names.assignee){
            jq$.each(nameList, function(name, id){
                jq$('<li>', {
                class: 'flex-list-items list-user',
                value: id,
                text: name,
                }).appendTo('#user-list');
            });
            jq$.each(nameList, function(){
                jq$('<li>', {
                class: 'flex-list-items list-assigned',
                }).appendTo('#assigned-list');
            });
        }

        else if(mode == "assign" && nameList == names.assignee){
                jq$.each(nameList, function(){
                    jq$('<li>', {
                    class: 'flex-list-items list-user',
                    }).appendTo('#user-list');
                });
                jq$.each(nameList, function(name, id){
                    jq$('<li>', {
                    class: 'flex-list-items list-assigned',
                    value: id,
                    text: name,
                    }).appendTo('#assigned-list');
            });
        }

        else if(mode == "default" && nameList == names.wf_owner){
            jq$.each(nameList, function(name, id){
                jq$('<li>', {
                class: 'flex-list-items list-user',
                value: id,
                text: name,
                }).appendTo('#user-list');
            });
            jq$.each(nameList, function(){
                jq$('<li>', {
                class: 'flex-list-items list-assigned',
                }).appendTo('#assigned-list');
            });
    }

        else if(mode == "assign" && nameList == names.wf_owner){
            jq$.each(nameList, function(){
                jq$('<li>', {
                class: 'flex-list-items list-user',
                }).appendTo('#user-list');
            });
            jq$.each(nameList, function(name, id){
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
        var index = 1;
        for(var name in dict){
            if(name == target){
                break;
            }
            ++index;
        }
        return index;
    }

    //Extract names from dropdown box
    function mapAssignee(program_office, costing_unit){
        var assignee_selector = null;
        var wf_owner_selector = null;

        if(program_office == 5){
            assignee_selector = jq$('[name="taskAssigneesInfo[0].selectedAssignee[2]"] option');
        }

        //These program office have the same html tag names
        else if(program_office == 18153 || program_office == 18356){
            //value of first costing unit if exist is NaN
            if(isNaN(costing_unit)){
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


    //Convert text and value to a list
    function mapFromElement(HTML_selector){
        var result = {};

        jq$(HTML_selector).each(function(){
            if(jq$(this).text() != ""){
                result[jq$(this).text()] = jq$(this).val();
            }
        })
        return result;
    }
})(jQuery);

