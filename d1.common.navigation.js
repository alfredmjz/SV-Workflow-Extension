/*!
 * SV-Functions
 * Licensed under MIT
 */

//Create floating navigation bar at top
(function (jq$) {
  "use strict";
  var debugging = true;
  var searchSchoolId = true;
  var recur = 0;

  //Parse user information
  var userinfo = jq$(".logged-in-user-text:first")
    .text()
    .trim()
    .split("));")[1];

  //Link to bootstrap and common CSS
  var css_bootstrap = document.createElement("link");
  css_bootstrap.rel = "stylesheet";
  css_bootstrap.type = "text/css";
  css_bootstrap.href = chrome.runtime.getURL("bootstrapiso.min.css");
  (document.head || document.documentElement).appendChild(css_bootstrap);

  var css_common = document.createElement("link");
  css_common.rel = "stylesheet";
  css_common.type = "text/css";
  css_common.href = chrome.runtime.getURL("d1.common.css");
  (document.head || document.documentElement).appendChild(css_common);

  //Jump to profile record on unique School ID search
  function nav_search() {
    //This step is required when searching from outside Enrollment Manager
    jq$.ajax({
      type: "GET",
      async: false,
      url:
        "https://" +
        (d1$.isEmpty(d1$.hostname) ? window.location.hostname : d1$.hostname) +
        "/srs/enrolmgr/common/profile/studentGroupSearch.do?method=load&newsession=true",
    });

    //Search for object id by student number
    var schoolId = jq$("#searchSchoolId").val();

    var searchUrl =
      "https://" +
      (d1$.isEmpty(d1$.hostname) ? window.location.hostname : d1$.hostname) +
      "/srs/enrolmgr/common/profile/studentGroupSearch.do?" +
      "method=searchStudents&externalObjectId=0&studentNumber=<studentNo>&studentSurname=&studentGivenName=&studentPhoneAreaCode=" +
      "&studentPhoneNumber=&studentCredential=&studentEmail=&studentZipCode=&studentSIN=&studentSchoolNumber=<schoolId>" +
      "&loginId=&studentEmployer=&studentTransactionNumber=&studentTransType=ALL&studentDayOfBirth=&studentMonthOfBirth=" +
      "&studentYearOfBirth=&studentGroupName=&studentSearchType=contain&createAnyway=&groupNumber=&groupName=&groupPhoneAreaCode=" +
      "&groupPhoneNumber=&groupTransactionNumber=&groupTransType=ALL&groupDeptNumber=&membershipStatus=&groupZipCode=" +
      "&transactionDateStartString=&transactionDateStart.day=&transactionDateStart.month=&transactionDateStart.year=" +
      "&transactionDateStart.hour=&transactionDateStart.minute=&transactionDateStart.ampm=&transactionDateEndString=" +
      "&transactionDateEnd.day=&transactionDateEnd.month=&transactionDateEnd.year=&transactionDateEnd.hour=&transactionDateEnd.minute=" +
      "&transactionDateEnd.ampm=&memberSurname=&memberGivenName=&groupSearchType=contain&groupTypeSearch=&groupStatus=active#results";

    if (searchSchoolId) {
      if (debugging) console.log("Searching for School ID: " + schoolId);
      searchUrl = searchUrl.replace("<schoolId>", schoolId);
      searchUrl = searchUrl.replace("<studentNo>", "");
    } else {
      if (debugging) console.log("Searching for Student Number: " + schoolId);
      searchUrl = searchUrl.replace("<schoolId>", "");
      searchUrl = searchUrl.replace("<studentNo>", schoolId);
    }
    //alert(searchUrl);
    jq$.ajax({
      type: "GET",
      url: searchUrl,
      success: function (data) {
        //Parse businessObjectId from response
        var myreg = /return doStudentProfileEdit\((.*)\);/gm;
        var match = myreg.exec(data);

        if (!match && recur < 6) {
          recur++;
          searchSchoolId = false;
          nav_search();
          return true;
        }

        if (debugging)
          console.log("Student search success; businessObjectId: " + match[1]);

        //Browse to student profile
        var postUrl =
          "https://" +
          (d1$.isEmpty(d1$.hostname)
            ? window.location.hostname
            : d1$.hostname) +
          "/srs/enrolmgr/student/profile/studentProfile.do?" +
          "method=edit&refresh=true&businessObjectId=<objectId>&originate=studentSelectedCoursesForm";
        window.location = postUrl.replace("<objectId>", match[1]);
      },

      error: function (msg) {
        if (debugging)
          console.log(
            "Student search FAILED:\n" + JSON.stringify(msg, null, 4)
          );

        if (recur < 6) {
          recur++;
          nav_search();
          return true;
        }
      },
    });

    return true;
  }

  //Return HTML-formatted navigation menu
  function nav_menu() {
    //Store navigation menu objects (key : [label, nodes])
    var nav_objects = {
      CurrMgr: [
        "Curriculum",
        "CurrMgr.Courses;CurrMgr.Courses.CourseSearch;CurrMgr.Courses.BatchSectionCreateSearch;CurrMgr.Courses.BatchSectionCreateHistory;CurrMgr.Calendar;CurrMgr.Calendar.Years;CurrMgr.Calendar.Terms;CurrMgr.Calendar.HolidayCalendar;CurrMgr.Calendar.PublishingDates;CurrMgr.Certificates;CurrMgr.Certificates.Certificate;CurrMgr.Programs;CurrMgr.Programs.ProgramSearch;CurrMgr.Instructors;CurrMgr.Instructors.InstructorSearch;CurrMgr.Instructors.InstructorContractSearch;CurrMgr.Locations;CurrMgr.Locations.Campus;CurrMgr.Locations.Building;CurrMgr.Locations.Room;CurrMgr.Association;CurrMgr.Association.Association;CurrMgr.ApplicationManager;CurrMgr.ApplicationManager.ApplicationSearch;CurrMgr.ApplicationManager.AddApplication;CurrMgr.ApplicationManager.QuestionnaireSearch;CurrMgr.ApplicationManager.AddQuestionnaire;CurrMgr.Grading;CurrMgr.Grading.GradeType;CurrMgr.Grading.GradingTemplate;CurrMgr.Grading.GradingSheetRapidEntry;CurrMgr.Bundle;CurrMgr.Bundle.BundleSearch;CurrMgr.Proctors;CurrMgr.Proctors.ProctorSearch;CurrMgr.Proctors.ProctorNewProfile;CurrMgr.Proctors.Merge",
      ],
      EnrolMgr: [
        "Enrollment",
        "EnrolMgr.Profile;EnrolMgr.Courses;EnrolMgr.Courses.Search;EnrolMgr.Courses.Selected;EnrolMgr.MergeRecords;EnrolMgr.AgencyContractSearch;EnrolMgr.AgencyContractSearch.AgencyContractSearch;EnrolMgr.GroupForm;EnrolMgr.GroupForm.Admin;EnrolMgr.GroupForm.Submit;",
      ],
      ConfMgr: ["Conference", "ConfMgr.Conference;ConfMgr.Client"],
      TaskMgr: [
        "Tasks",
        "TaskMgr.TaskList;TaskMgr.DeptTaskList;TaskMgr.MessageList;TaskMgr.SendMessage;TaskMgr.PersonalSetup",
      ],
      AccMgr: [
        "Accounting",
        "AccMgr.Adjustments;AccMgr.Adjustments.Add;AccMgr.Adjustments.Search;AccMgr.ExpenseImportAllocation;AccMgr.ExpenseImportAllocation.AllocationSearch;AccMgr.ExpenseImportAllocation.EnterManualAllocation;AccMgr.InvoiceGeneration;AccMgr.SpecialRequests",
      ],
      MktMgr: [
        "Marketing",
        "MktMgr.Categories;MktMgr.Categories.CourseCategories;MktMgr.Categories.ProgramAreas;MktMgr.Categories.Streams;MktMgr.MarketingQuestions;MktMgr.MarketingQuestions.MarketingQuestions;MktMgr.PublicView;MktMgr.PublicView.PublicViewConfiguration;MktMgr.PublicView.StoryList;MktMgr.PublicView.AddStory;MktMgr.PublicView.NewContentManagement;MktMgr.CatalogExport;MktMgr.CatalogExport.CourseSearch;MktMgr.CatalogExport.TemplateSearch;MktMgr.CatalogExport.AddTemplate;MktMgr.CatalogExport.ExportedFiles;MktMgr.FileUpload;MktMgr.ListManager;MktMgr.ListManager.ListSearch;MktMgr.ListManager.Add;MktMgr.CampaignManager;MktMgr.CampaignManager.CampaignSearch;MktMgr.CampaignManager.AddCampaign;MktMgr.CampaignManager.CommunicationSearch;MktMgr.CampaignManager.AddCommunication;MktMgr.CampaignManager.ExportedCommunications;MktMgr.InterestAreas;MktMgr.InterestAreas.InterestAreaSearch;MktMgr.InterestAreas.InterestAreaProfile",
      ],
      SysAdmin: [
        "System",
        "SysAdmin.Fee;SysAdmin.Fee.TuitionProfile;SysAdmin.Fee.Discount;SysAdmin.Fee.Surcharge;SysAdmin.Fee.ServiceCharge;SysAdmin.Fee.SpecialRequest;SysAdmin.Fee.InstructionMethod;SysAdmin.System;SysAdmin.System.SchoolInfo;SysAdmin.System.DynamicList;SysAdmin.System.TaskSetup;SysAdmin.System.ChangePassword;SysAdmin.System.UploadFile;SysAdmin.System.EmailTemplate;SysAdmin.System.Notification;SysAdmin.System.ConfigurationEditor;SysAdmin.System.ConfigurationChangeSummary;SysAdmin.System.ServerSummary;SysAdmin.System.ConfigurationChangeFileHistory;SysAdmin.System.SetupAssistant;SysAdmin.System.EncryptionKeys;SysAdmin.System.LicenseSummary;SysAdmin.Accounting;SysAdmin.Accounting.GLAccount;SysAdmin.Accounting.GLAccountMapping;SysAdmin.Accounting.GLAccountMappingOverride;SysAdmin.Accounting.Tax;SysAdmin.AccessControl;SysAdmin.AccessControl.ProgramOffices;SysAdmin.AccessControl.CostingUnits;SysAdmin.AccessControl.Users;SysAdmin.AccessControl.SystemAccounts;SysAdmin.AccessControl.Roles;SysAdmin.AccessControl.Permissions;SysAdmin.AccessControl.Authentication;SysAdmin.Contacts;SysAdmin.Contacts.Search;SysAdmin.Contacts.Profile;SysAdmin.Contacts.Merge;SysAdmin.DataImport;SysAdmin.DataImport.StudentAndGroupEnrollments;SysAdmin.DataImport.Grades;SysAdmin.DataImport.Instructors;SysAdmin.DataImport.Curriculums;SysAdmin.DataImport.ProgramOfferingEnrollments;SysAdmin.DataImport.OfferingSectionEnrollments;SysAdmin.DataImport.Proficiency;SysAdmin.DataImport.OtherAcademicHistory;SysAdmin.DataImport.OtherAcademicHistoryCourses;SysAdmin.DataImport.Expenses;SysAdmin.DataExport;SysAdmin.DataExport.Blackboard;SysAdmin.DataExport.Banner;SysAdmin.DataExport.Student;SysAdmin.DataExport.CourseSectionProfile;SysAdmin.DataExport.CourseProfile;SysAdmin.DataExport.StudentEnrollment;SysAdmin.DataExport.StudentGrade;SysAdmin.EnrollmentRules;SysAdmin.EnrollmentRules.Restrictions;SysAdmin.EnrollmentRules.Maximums;SysAdmin.EnrollmentRules.ProficiencyExam;SysAdmin.EnrollmentRules.CoursePrerequisites;SysAdmin.EnrollmentRules.HoldReasons;SysAdmin.Integration.AdaptorConfig;SysAdmin.Integration;SysAdmin.AdaptorTroubleshoot",
      ],
      Reporting: [
        "Reports",
        "Reporting.Tableau;Reporting.Registration;Reporting.Program;Reporting.Accounting;Reporting.Master;Reporting.Configuration;Reporting.Configuration.Signatures;Reporting.Configuration.UploadBackground;Reporting.Configuration.Certificates;Reporting.IntlStudent;Reporting.IntlStudent.Activities",
      ],
      BiDashboard: ["Dashboard", ""],
    };

    var ext_links = {
      "Reporting.Tableau": "https://bi.destinysolutions.com/#/site/York/views",
      "EnrolMgr.GroupForm": "https://continue.yorku.ca/groupadmin",
      "EnrolMgr.GroupForm.Admin": "https://continue.yorku.ca/groupadmin",
      "EnrolMgr.GroupForm.Submit": "https://continue.yorku.ca/groupsubmit",
    };

    //Retrieve list of displayed menu objects (all but the current node)
    var nav_shown = [];
    jq$("li.mainMenuTrigger div a").each(function () {
      nav_shown.push(
        $(this).attr("href").replace("/srs/navigation.do?from=", "")
      );
    });

    //Cycle nodes in nav_objects (each represents a top level menu/module)
    var nav_html = "";
    jq$.each(nav_objects, function (node, data) {
      var menu_class = "";
      var menu_html = "";
      var link = "";
      var target = "";

      //Cycle objects in this node
      jq$.each(nav_objects[node][1].split(";"), function (index, value) {
        var splitvalue = value.split(".");

        if (value in ext_links) {
          link = ext_links[value];
          target = ' target="_blank"';
        } else {
          link = "/srs/navigation.do?from=" + value;
        }

        if (splitvalue.length - 1 > 1) {
          //Single node, no children

          menu_html +=
            '<li class="dropdown-item"><a' +
            target +
            ' href="' +
            link +
            '">' +
            splitvalue[splitvalue.length - 1]
              .replace(/([A-Z]+)/g, " $1")
              .trim() +
            "</a></li>";
        } else {
          //Parent node

          menu_class = "";
          if (nav_objects[node][1].split(value + ".").length - 1 > 0)
            menu_class = "dropright";
          menu_html +=
            '</ul></li><li class="dropdown-item dropdown-submenu ' +
            menu_class +
            '"><a' +
            target +
            ' href="' +
            link +
            '">' +
            splitvalue[splitvalue.length - 1]
              .replace(/([A-Z]+)/g, " $1")
              .trim() +
            '</a><ul class="dropdown-menu">';
        }
      });

      //Adjust style for current node buttons
      menu_class = "btn-info";
      if (jq$.inArray(node, nav_shown) < 0) menu_class = "btn-primary";

      //Fill out the individual node and add to the overall menu
      menu_html =
        '<div class="nav-item dropdown navbar-nav-button"> <!-- ' +
        nav_objects[node][0] +
        " -->" +
        '<div class="btn-group mr-1" role="group">' +
        '<a class="btn btn-sm ' +
        menu_class +
        '" href="/srs/navigation.do?from=' +
        node +
        '">' +
        nav_objects[node][0] +
        "</a>" +
        '<div class="btn-group" role="group">' +
        '<button id="d1button' +
        node +
        '" type="button" class="btn btn-sm ' +
        menu_class +
        ' dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>' +
        '<ul class="dropdown-menu" style="left:-' +
        nav_objects[node][0].length * 8 +
        'px;">' +
        menu_html.substr(10) +
        menu_html.substr(0, 10) +
        "</ul>" +
        "</div>" +
        "</div>" +
        "</div>";
      menu_html = menu_html.replace('<ul class="dropdown-menu"></ul>', "");
      nav_html += menu_html;
    });

    return nav_html;
  }

  //Insert alternate navigation elements before #navigation01
  jq$(
    '<div id="navigation-alt" class="bootstrapiso">' +
      '<nav class="navbar navbar-expand-md navbar-dark navbar-expand bg-light">' +
      '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">' +
      '<span class="navbar-toggler-icon"></span>' +
      "</button>" +
      '<div class="navbar-collapse" id="navbarSupportedContent">' +
      '<div class="navbar-nav" >' +
      nav_menu() +
      "</div>" +
      '<div class="btn-group btn-group-xs col-sm-12" role="group">' +
      '<input id="searchSchoolId" type="text" class="" style="" placeholder="School ID">' +
      '<button id="goSchoolId" class="btn btn-info btn-sm" href="#">&gt;</button>' +
      "</div>" +
      "</div><!-- /.navbar-collapse -->" +
      "</nav>" +
      "</div>"
  )
    .insertBefore("#navigation01")
    .show();

  //Create event triggers
  jq$("li.dropdown-submenu").hover(
    function () {
      jq$(this).find(".dropdown-menu").stop(true, true).delay(200).fadeIn(750);
    },
    function () {
      jq$(this).find(".dropdown-menu").stop(true, true).delay(200).fadeOut(750);
    }
  );

  jq$(".btn")
    .mouseenter(function () {
      jq$(this).children("span").removeClass("reset").addClass("enter");
    })
    .mouseleave(function () {
      jq$(this).children("span").removeClass("enter").addClass("leave");
      setTimeout(function () {
        jq$(".btn span.leave").removeClass("leave").addClass("reset");
      }, 500);
    });

  //Jump to student profile by student number (School ID)
  jq$("#goSchoolId").click(function (event) {
    nav_search();
  });

  jq$("#searchSchoolId").keypress(function (e) {
    if (e.which == 13) {
      nav_search();
    }
  });

  //Optional: Hide or detach default UI elements
  //$("#task-icons-panel").detach().appendTo('#navigation-alt');
  //$('<div class="clear">&nbsp;</div>').appendTo('#navigation-alt');
  //$("#navigation01").hide();
})(jQuery);
