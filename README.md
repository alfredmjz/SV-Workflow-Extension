# SV-Workflow-Extension
SV Workflow Extension is a Google Chrome extension which provides additional functionality to York University's Destiny One platform. This addition aims to revamps and reorganize the structure of Workflow Setup for a more user-friendly environment.

# Current Problem
With the current build of Workflow Setup, there are two step process to add a single assignee for each event. 
1.  Select the assignee name for Event X.
2.  Click on "+" button to confirm the assignment.

Assume there are 10 events and for each event, 10 assignees have to be added. The user will have to repeat the two-step process for 100 times. After setting up the assignees to the appropriate events, the user has to click on "Save" in order to sync and update the current page with the database. If the page was refreshed unexpectedly, the user will have to redo everything from the beginning. 

This workflow has made the process too tedious and inefficient.

# Solution

A bulk control system which allows users to select multiple assignees to multiple events. This control should be dynamic such that the names of the assignee are fetched accordingly to the Program Office and its Costing Unit. This implementation will considerably reduce the number of clicks by eliminating the two-step process.

# Base Version:
  - Tabular view of assignee and assignment for a particular Program Office and Costing Unit
  - Bulk controls which include select all assignee, deselect all assignee and a customized save button
  - Checkboxes on each event
  - A Scroll Up button which automatically brings user to the top of the page when clicked

# UPDATED: Version 1.1
  - Added Workflow Owner assignment
  - Added toggle button to switch between Assignee assignment and Workflow Owner assignment
  - Updates functionality for Workflow Owner assignment
  - Added master checkbox on each table
  - Added Hide/Show button
