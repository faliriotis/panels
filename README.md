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

Initialize
----------
The most basic usage of panels is initialized just like jquery tabs. For more examples,
see the files in the examples folder.

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
    [{
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
* exportStructure

* openPanel

* closePanel

* isPanelOpen

* togglePanel

* movePanelToGroup

* moveGroupToGroupOfGroups

* movePanelToGroupOfGroups

Events
------
* panelOpened

* panelClosed

* panelMoved

* panelGroupMoved

* panelResized