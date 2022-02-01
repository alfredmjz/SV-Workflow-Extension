    /*********Functions**********/

    export function makePostCall(methodName, assignee, eventID, program_office, costing_unit){
        if(isNaN(costing_unit)){
            costing_unit = "";
        }

        //Static data
        var postData = {
            method: methodName,
            programOfficeId: program_office,
            displayPage: false,
            costingUnitId: costing_unit,
            roleId: 0,
        };

        //Dynamic data
        var eventIndex;
        jq$.each(assignee, function(name, id){
            for (var key = 0; key < eventID.length; key++) {
                postData['processIndex'] = key
                postData['processOverseer[' + key + ']'] = "";
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
    };


    //default = push all names to left of table
    //assign = push all names to right of table
    export function addNameList(mode){
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
                }).appendTo('#assigned-list');
            });
        }

        else if(mode == "assign"){
                jq$.each(names.assignee, function(){
                    jq$('<li>', {
                    class: 'flex-list-items list-user',
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
    export function findPos(dict, target){
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
    export function mapAssignee(program_office, costing_unit){
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
    export function mapFromElement(HTML_selector){
        var result = {};

        jq$(HTML_selector).each(function(){
            if(jq$(this).text() != ""){
                result[jq$(this).text()] = jq$(this).val();
            }
        })
        return result;
    }