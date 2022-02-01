import { makePostCall, addNameList, findPos, mapAssignee, mapFromElement} from "./d1.workflow.util.js"

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
            + '<li class="flex-first-row">User</li>'
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
        addNameList("default");
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
            // jq$("assigneeList").click(function(){

            // });

            // jq$("wfOwnerList").click(function(){

            // });

            jq$("#moveAllRight").click(function(){
                jq$(".list-user").remove();
                jq$(".list-assigned").remove();
                addNameList("assign");

            });

            jq$("#moveAllLeft").click(function(){
                jq$(".list-user").remove();
                jq$(".list-assigned").remove();
                addNameList("default");
            });

            jq$("#applySubmit").click(function(){
                var finalized_name = mapFromElement(jq$('.list-assigned'));
                makePostCall('addTaskAssignee', finalized_name, tableID, selected_office, selected_cu);
                var save_data = {
                    method: "update",
                    programOfficeId: selected_office,
                    displayPage: false,
                    costingUnitId: selected_cu,
                    processIndex: 0,
                    taskIndex: 0,
                    roleId: 0,
                    taskAssigneeId: 0,
                };

                //Save data after adding users
                jq$.ajax({
                    type: "POST",
                    async: false,
                    data: save_data,
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
                window.location.reload();
            });

})(jQuery);

