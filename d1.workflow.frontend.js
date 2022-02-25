/** @format */

(function (jq$) {
  "use strict";
  //jq$ is jQuery
  //d1$ is a global object for common functions and variables
  var debugging = false;

  //Convert String type to number
  var selected_office = parseInt(
    jq$('[name="programOfficeId"] option:selected').val()
  );
  const no_cu = [5, 4, 1];

  //True if current Program Office have a costing unit
  //Indexes of non costing units are: [5,4,1]
  if (jq$.inArray(selected_office, no_cu) === -1) {
    var selected_cu = parseInt(
      jq$('[name="costingUnitId"] option:selected').val()
    ); //Selected CU
  }

  if (selected_office == 4) {
    //Don't generate table for Dean's Office
  } else {
    //names holds two properties: assignee and wf_owner
    var names = mapAssignee(selected_office, selected_cu);

    //Creating Table view
    jq$(
      "<div id='loadDisplay'>" +
        "<div id='loader'></div>" +
        "<p id='processes'>Submitting POST request(s)...</p></div>"
    ).insertBefore("#main-area-body");

    jq$(
      "<div id='hide-container'>" +
        '<button type="button" id="util_hidder" class="yui3-button">Hide</button>' +
        "</div>"
    ).appendTo("#main-area-body");

    jq$('[name="programOfficeId"]')
      .closest("tr")
      .append(
        '<td id="flexcontainer">' +
          '<div id="changeAssignment"> <div id="button-wrapper">' +
          '<p class="toggleText"> Assignee </p>' +
          '<label class="switch-wrapper">' +
          '<input type="checkbox" id="optionToggle" value="assignee">' +
          '<span class="toggle-slider"></span></label>' +
          '<p class="toggleText"> Workflow Owner </p></div>' +
          '<div id="flexbox">' +
          '<div class="user-flexchild"> </div>' +
          '<div class="assigned-flexchild"> </div>' +
          "</div></td>"
      );
    jq$(".user-flexchild").append(
      '<ul id="user-list" class="content-list">' +
        '<li class="flex-first-row">Name</li>' +
        "</ul>"
    );

    jq$(".assigned-flexchild").append(
      '<ul id="assigned-list" class="content-list">' +
        '<li class="flex-first-row">Assignee</li>' +
        "</ul>"
    );

    jq$("#flexcontainer").append(
      '<div id="button-wrapper">' +
        '<button type="button" id="moveAllLeft" class="yui3-button"><<</button>' +
        '<button type="button" id="applySubmit" class="yui3-button">Submit</button>' +
        '<button type="button" id="moveAllRight" class="yui3-button">>></button>' +
        "</div>"
    );

    //Append list to table for availble users in the current PO/CU
    addNameList("default", names.assignee);
  }

  //Create checkboxes for each event
  var officeName = jq$("table").find(":selected").attr("value");
  var applicableOffice = ["18153", "18356", "21453563"];

  if (applicableOffice.includes(officeName)) {
    //Retrieve Workflow Name
    var workflowText = jq$("nobr:contains('Workflow')").closest("td.content");
    var editText = {};
    jq$(workflowText).each(function (index) {
      editText[index] = jq$(this).text().replace("Workflow", "").trim();
    });

    jq$(".fullWidthTable").each(function () {
      //Insert Select Title
      jq$(
        '<td class="goldTableTitle"> <input id="allRows" type="checkbox" name="title"> Select </td>'
      ).prependTo(jq$(this).find("tr").eq(1));

      //Insert Checkbox
      jq$(
        '<td class="goldTableCell" valign="top">' +
          '<input type="checkbox" name="event">' +
          "</td>"
      ).prependTo(jq$(this).find("tr:nth-child(2n + 3)"));
    });
  }

  var pos;
  //".on" function delegate previous DOM objects to its current modified version (can't use .click)
  jq$(".content-list").on("click", ".flex-list-items", function (e) {
    //Move selected user to right of table
    pos = findPos(names.assignee, jq$(this).text());
    ``;

    if (
      jq$("#optionToggle").val() == "assignee" &&
      jq$(this).is(".list-user")
    ) {
      jq$(this).replaceWith("<li class='flex-list-items list-user'></li>");
      jq$("#assigned-list > li:eq(" + pos + ")").replaceWith(this);
      jq$(this).addClass("list-assigned").removeClass("list-user");
    }

    //Move selected user to left of table
    else if (
      jq$("#optionToggle").val() == "assignee" &&
      jq$(this).is(".list-assigned")
    ) {
      jq$(this).replaceWith("<li class='flex-list-items list-assigned'></li>");
      jq$("#user-list > li:eq(" + pos + ")").replaceWith(this);
      jq$(this).addClass("list-user").removeClass("list-assigned");
    } else if (
      jq$("#optionToggle").val() == "overseer" &&
      jq$(this).is(".list-user")
    ) {
      jq$(this).siblings().removeAttr("id");
      jq$(this).attr("id", "selectedName");
    } else if (
      jq$("#optionToggle").val() == "overseer" &&
      jq$(this).is(".list-assigned")
    ) {
      if (jq$(this).is(".selectedEventItem")) {
        jq$(this).removeClass("selectedEventItem");
        return;
      }
      jq$(this).addClass("selectedEventItem");
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
  jq$("#optionToggle").click(function () {
    jq$(".list-user").remove();
    jq$(".list-assigned").remove();

    if (jq$(this).val() == "overseer") {
      jq$("#user-list .flex-first-row").text("Name");
      jq$("#assigned-list .flex-first-row").text("Assignee");
      jq$(this).val("assignee");

      addNameList("default", names.assignee);
    } else if (jq$(this).val() == "assignee") {
      jq$("#user-list .flex-first-row").text("Workflow Owner");
      jq$("#assigned-list .flex-first-row").text("Event");
      jq$("#moveAllLeft").text("No Events");
      jq$("#moveAllRight").text("All Events");
      jq$(this).val("overseer");

      addNameList("default", names.wf_owner);
    }
  });

  jq$("#moveAllLeft").click(function () {
    if (jq$("#optionToggle").val() == "assignee") {
      jq$(".list-user").remove();
      jq$(".list-assigned").remove();
      addNameList("default", names.assignee);
    } else {
      jq$(".list-assigned").removeClass("selectedEventItem");
    }
  });

  jq$("#moveAllRight").click(function () {
    if (jq$("#optionToggle").val() == "assignee") {
      jq$(".list-user").remove();
      jq$(".list-assigned").remove();
      addNameList("assign", names.assignee);
    } else {
      jq$(".list-assigned").addClass("selectedEventItem");
    }
  });

  jq$('#allRows[name="title"]').change(function () {
    if (jq$(this).is(":checked")) {
      jq$(this)
        .closest("tr")
        .siblings()
        .find('[name="event"]')
        .prop("checked", true);
    } else {
      jq$(this)
        .closest("tr")
        .siblings()
        .find('[name="event"]')
        .prop("checked", false);
    }
  });

  jq$("#util_hidder").click(function () {
    if (jq$("#flexcontainer").children().css("visibility") === "visible") {
      jq$("#flexcontainer").children().css("visibility", "hidden");
      jq$(this).html("Show");
    } else {
      jq$("#flexcontainer").children().css("visibility", "visible");
      jq$(this).html("Hide");
    }
  });

  jq$("#applySubmit").click(function () {
    var checkedEvents = getCheckedEvents();
    jq$("#loadDisplay").show();
    jq$("#main-area-body").hide();

    if (jq$("#optionToggle").val() == "assignee") {
      var finalized_name = mapFromElement(jq$(".list-assigned"));
      //Count # of POST requests (No. of names * No. of selected rows)
      var total = 0;
      jq$.each(checkedEvents, function (index, value) {
        if (checkedEvents[index] != undefined) {
          total += checkedEvents[index].length;
        }
      });
      total *= Object.keys(finalized_name).length;

      postAssignee(
        finalized_name,
        checkedEvents,
        selected_office,
        selected_cu,
        total
      );
    } else {
      var overseerEvents = [];
      jq$(".selectedEventItem").each(function (index) {
        overseerEvents[index] = jq$(this).val();
      });

      var overseer_id = jq$("#selectedName").val();
      postOverseer(overseer_id, overseerEvents, selected_office, selected_cu);
    }

    location.reload(true);
  });

  /*********Util functions**********/
  /* Reads the table id and its' row id of only checked checkboxes */
  function getCheckedEvents() {
    var tableName = null;
    var extract_col = null;
    var tableID = [];
    var taskAssigneesInfo;
    var selectedAssignee;
    var checkboxSelector = jq$('.goldTableCell [name="event"]:checked');
    jq$.each(checkboxSelector, function () {
      //Get ID of checked tables
      tableName = jq$(this).closest("table.fullWidthTable tr");

      //Select the targeted row
      extract_col = jq$(tableName)
        .find(".goldTableCell:eq(4) .smallMarginWrapper select")
        .attr("name");

      //Retrieve table ID
      taskAssigneesInfo = parseInt(
        extract_col.substring(
          extract_col.indexOf("[") + 1,
          extract_col.indexOf("]")
        )
      );

      //Retrieve row ID
      selectedAssignee = parseInt(
        extract_col.substring(
          extract_col.lastIndexOf("[") + 1,
          extract_col.lastIndexOf("]")
        )
      );

      //Push array of selected ID into a list where its keys represents the table ID
      if (!tableID[taskAssigneesInfo]) {
        tableID[taskAssigneesInfo] = [];
      }

      tableID[taskAssigneesInfo].push(selectedAssignee);
    });
    return tableID;
  }

  /* Gather and organize selected data to make a POST request */
  function postAssignee( nameList, events, program_office, costing_unit, requestTotal) {
    if (isNaN(costing_unit)) {
      costing_unit = "";
    }

    //Static data
    var eventIndex = 0;
    var currentReq = 0;
    var addData = {
      method: "addTaskAssignee",
      programOfficeId: program_office,
      displayPage: false,
      costingUnitId: costing_unit,
    };
    var saveData = {
      method: "update",
      programOfficeId: selected_office,
      displayPage: false,
      costingUnitId: selected_cu,
    };

    //Dynamic data
    jq$.each(nameList, function (name, id) {
      for (var key = 0; key < events.length; key++) {
        if (events[key] == undefined) {
          continue;
        }
        addData["processIndex"] = key;
        for (var value = 0; value < events[key].length; value++) {
          eventIndex = events[key][value];
          addData["taskIndex"] = eventIndex;
          addData["roleId"] = 0;
          addData["taskAssigneeId"] = id;
          addData[
            "taskAssigneesInfo[" +
              key +
              "].selectedAssignee[" +
              eventIndex +
              "]"
          ] = id;
          ajaxCallAssignee(addData, currentReq++, requestTotal);
        }
      }
    });
    ajaxCallAssignee(saveData, currentReq, requestTotal);
  }

  /* Calls asynchronous POST requests to update Assigned User */
  function ajaxCallAssignee(data, current_req, total_req) {
    return jq$.ajax({
      type: "POST",
      async: false,
      data: data,
      url:
        "https://" +
        (d1$.isEmpty(d1$.hostname) ? window.location.hostname : d1$.hostname) +
        "/srs/sysadmin/system/programOfficeTaskSetup.do?",

      success: function (success) {
        if (debugging) console.log("Data: " + success);
        // jq$("#processes").text(
        //     "Submitted POST request " + current_req + " of total " + total_req
        // );
        console.log(
          "Submitted POST request " + current_req + " of total " + total_req
        );
      },
      error: function (err) {
        if (debugging) console.log("Update FAILED: " + err);
      },
    });
  }

  /* Calls asynchronous POST request to update Workflow Owner */
  function postOverseer(overseer_id, events, program_office, costing_unit) {
    if (isNaN(costing_unit)) {
      costing_unit = "";
    }

    //Static data
    var postData = {
      method: "update",
      programOfficeId: program_office,
      displayPage: false,
      costingUnitId: costing_unit,
      processIndex: 0,
      taskIndex: 0,
      roleId: 0,
      taskAssigneeId: 0,
    };

    //Only 1 name for process overseer
    for (var key = 0; key < events.length; key++) {
      postData["processOverseer[" + key + "]"] = overseer_id;
      jq$("processOverseer[" + key + "] option").filter(function () {
        if (jq$(this).val() == overseer_id) {
          jq$(this).attr("selected", "selected");
        }
      });
    }
    jq$.ajax({
      type: "POST",
      data: postData,
      async: false,
      url:
        "https://" +
        (d1$.isEmpty(d1$.hostname) ? window.location.hostname : d1$.hostname) +
        "/srs/sysadmin/system/programOfficeTaskSetup.do?",

      success: function (data) {
        if (debugging) console.log("Data: " + data);
        // jq$("#processes").text(
        //   "Submitted POST request " + 1 + " of total " + 1
        // );
        console.log("Submitted POST request " + 1 + " of total " + 1);
      },
      error: function (msg) {
        if (debugging) console.log("Update FAILED: " + msg);
      },
    });
  }

  /*Generate dynamic name list based on existing Assignee or Workflow Owner list
    mode :  default = push all names to left of table
            assign = push all names to right of table
    Workflow Owner does not have "assign" mode, names are always on the left */
  function addNameList(mode, nameList) {
    if (mode == "default" && nameList == names.assignee) {
      jq$.each(nameList, function (name, id) {
        jq$("<li>", {
          class: "flex-list-items list-user",
          value: id,
          text: name,
        }).appendTo("#user-list");
      });
      jq$.each(nameList, function () {
        jq$("<li>", {
          class: "flex-list-items list-assigned",
        }).appendTo("#assigned-list");
      });
    } else if (mode == "assign" && nameList == names.assignee) {
      jq$.each(nameList, function () {
        jq$("<li>", {
          class: "flex-list-items list-user",
        }).appendTo("#user-list");
      });
      jq$.each(nameList, function (name, id) {
        jq$("<li>", {
          class: "flex-list-items list-assigned",
          value: id,
          text: name,
        }).appendTo("#assigned-list");
      });
    } else if (mode == "default" && nameList == names.wf_owner) {
      jq$.each(nameList, function (name, id) {
        jq$("<li>", {
          class: "flex-list-items list-user",
          value: id,
          text: name,
        }).appendTo("#user-list");
      });
      jq$.each(editText, function (index, value) {
        jq$("<li>", {
          class: "flex-list-items list-assigned",
          value: index,
          text: value,
        }).appendTo("#assigned-list");
      });
    }
  }

  /* Find index of keys from existing dictionary */
  function findPos(dict, target) {
    var index = 1;
    for (var name in dict) {
      if (name == target) {
        break;
      }
      ++index;
    }
    return index;
  }

  /* Extract Assignee names from dropdown box unique to each program office and costing unit*/
  function mapAssignee(program_office, costing_unit) {
    var assignee_selector = null;
    var wf_owner_selector = null;

    if (program_office == 5) {
      assignee_selector = jq$(
        '[name="taskAssigneesInfo[0].selectedAssignee[2]"] option'
      );
    }

    //These program office have the same html tag names
    else if (program_office == 18153 || program_office == 18356) {
      //value of first costing unit if exist is NaN
      if (isNaN(costing_unit)) {
        assignee_selector = jq$(
          '[name="taskAssigneesInfo[16].selectedAssignee[1]"] option'
        );
        wf_owner_selector = jq$('[name="processOverseer[16]"] option');
      } else {
        assignee_selector = jq$(
          '[name="taskAssigneesInfo[0].selectedAssignee[1]"] option'
        );
        wf_owner_selector = jq$('[name="processOverseer[0]"] option');
      }
    } else if (program_office == 4) {
      assignee_selector = jq$('[name="costingUnitDirectors[0]"] option');
    } else if (program_office == 3) {
      assignee_selector = jq$(
        '[name="taskAssigneesInfo[0].selectedAssignee[1]"] option'
      );
      wf_owner_selector = jq$('[name="processOverseer[0]"] option');
    } else if (program_office == 2) {
      assignee_selector = jq$(
        '[name="taskAssigneesInfo[1].selectedAssignee[1]"] option'
      );
      wf_owner_selector = jq$('[name="processOverseer[2]"] option');
    } else if (program_office == 1) {
      assignee_selector = jq$(
        '[name="taskAssigneesInfo[50].selectedAssignee[1]"] option'
      );
      wf_owner_selector = jq$('[name="processOverseer[50]"] option');
    }

    var assignee = mapFromElement(assignee_selector);
    var wf_owner = mapFromElement(wf_owner_selector);

    return { assignee: assignee, wf_owner: wf_owner };
  }

  /* Convert text and value to a list of objects*/
  function mapFromElement(HTML_selector) {
    var result = {};

    jq$(HTML_selector).each(function () {
      if (jq$(this).text() != "") {
        result[jq$(this).text()] = jq$(this).val();
      }
    });
    return result;
  }
})(jQuery);
