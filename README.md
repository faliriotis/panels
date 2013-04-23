panels
======

panels is a jquery ui widget that creates tabbed panels. These tabbed panels can be draggable, sortable, and resizable.

Usage
=====
Terms
-----
Before I explain how to use the panels widget, there are some terms that I use that I will explain here.

1. Panel: Holds the content that appears when you click a tab.
2. Group: Holds a list of tabs and the panels associated with those tabs.
3. Group of Groups: Holds one or many groups.

Groups in the same Group of Groups are attached to each other. Groups in different Groups of Groups can be
in completely different areas of the screen.

Dependencies
--------------------
panels dependends on jquery and jquery ui. In jquery ui, it uses the widget factory and the sortable and resizable interactions. You can, however, disable the sortable and resizable features through the panels options. So, if you didn't want those features you could use a version of jquery ui with only core and widget.

Initialize
----------
The most basic usage of panels is initialized just like jquery tabs. For more examples,
see the files in the examples folder.

Includes:

    <link rel="stylesheet" type="text/css" href="jquery.ui.panels.css">
    <script src="jquery.ui.panels.js"></script>

Html:

    <div id="panels">
    	<ul>
    		<li><a href="tab-1">Tab 1</a></li>
    		<li><a href="tab-2">Tab 2</a></li>
    	</ul>
    	<div id="tab-1">Tab 1 Content</div>
    	<div id="tab-2">Tab 2 Content</div>
    </div>
    
Javascript:

    $("#panels").panels();

Options
-------
* structure:
structure tells the panels how they should arrange themselves. It is an array of objects
that represent group of groups. Each group of groups object has an array called groups
that has objects to represent groups. Each group object has an array called panels that
has objects to represent panels. Finally, each panel object has an id that is a string
that equals the id of the panel. There are also some other options at each level. Here is
an example with all the options:

        structure: [{
    	    classes: "myCustomGroupOfGroupsClass",
    	    groups: [{
                classes: "myCustumGroupClass",
                panels: [{
                    id: "myPanelId"
                }],
                openPanel: "panelIdOfOpenPanel"
            }],
            resizable: {
                handles: "s sw w"
            }
        }]
    
    

* panelsSortable:
A boolean that indicates if the tabs within a group should be sortable. Default is true.

* groupsSortable:
A boolean that indicates if the groups with a group of groups should be sortable. Default is true.

* openPanelOnAdd:
A boolean that indicates if a panel should be opened automatically when it is dragged to a new group. Default is true.

Methods
-------
jQuery UI allows you to call methods like this:

    $("#panels").panels("openPanel", $("#tab-1"));

* exportStructure: Returns an array that represents the current state of the panels (see the structure option). If you want to keep track
of how a user configured their panels, you can save the result of this function and then construct an instance of panels
later on using the result of this function as the structure option.

* openPanel(panelElement):
Opens the panel element.

* closePanel(panelElement): 
Closes the panel element

* isPanelOpen(panelElement):
Returns true if the panel is open, false otherwise.

* togglePanel(panelElement):
If the panel element is opened, it will close it. Otherwise, it will open it.

* movePanelToGroup(panelElement, groupElement [, index]):
Moves the panel element to the panel group. If you specify an index, the tab will be
inserted at that index. Otherwise, the tab will be added to the end.

* moveGroupToGroupOfGroups(groupElement, groupOfGroupsElement [, index]):
Moves the group element to the group of groups element. If you specify an index, the group
will be inserted at that index. Otherwise, the group will be added to the end.

* movePanelToGroupOfGroups(panelElement, groupOfGroupsElement [, index]):
Creates a new group inside of the group of groups element and moves the panel element to
that new group. If you specify an index, the new group will be inserted at that index.
Otherwise, the group will be added to the end.

Events
------
jQuery UI gives two ways to listen to events on a widget. You can put a callback function when you construct the widget, like this:

    $("#panels").panels({
        panelOpened: function(event, panelsObject) {
            alert("Panel with id " + panelsObject.panelElement.attr("id") + " was opened!");
        }
    });

or you can listen like this:

    $("#panels").panels("panelspanelopened", function(event, panelsObject) {
        alert("Panel with id " + panelsObject.panelElement.attr("id") + " was opened!");
    });


* panelOpened:
Fired when a panel is opened. Returns an object that contains an attribute "panelElement," which
is a jQuery representation of the panel element.

* panelClosed:
Fired when a panel is closed. Returns an object that contains an attribute "panelElement," which
is a jQuery representation of the panel element.

* panelMoved:
Fired when a panel is moved. Returns an object that contains the following attributes:
 * panelElement - jQuery representation of the panel element
 * oldGroupElement - jQuery representation of the old group element
 * newGroupElement - jQuery representation of the new group element
 * oldGroupOfGroupsElement - jQuery representation of the old group of groups element
 * newGroupOfGroupsElement - jQuery representation of the new group of groups element

* panelGroupMoved:
Fired when a panel group is moved. Returns an object that contains the following attributes:
 * groupElement - jQuery representation of the group element
 * oldGroupOfGroupsElement - jQuery representation of the old group of groups element
 * newGroupOfGroupsElement - jQuery representation of the new group of groups element

* panelResized:
Fired when a panel has finished resizing. Returns an object that contains an attribute "panelElement," which
is a jQuery representation of the panel element.