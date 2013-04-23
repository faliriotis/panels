(function($) {
	$.widget("ui.panels", {
		// default options
		options: {
			panelsSortable: true,
			groupsSortable: true,
			openPanelOnAdd: true
		},

		// the constructor
		_create: function() {
			this.providedTabList = this.element.children("ul").first().detach();
			
			if (this.options.structure) {
				this.structure = this.options.structure;
			} else {
				this.structure = this._createDefaultStructure();
			}
			
			var groupOfGroupsList = this.structure;
			
			this.nextGroupOfGroupsId = 0;
			this.nextGroupId = 0;
			this.nextPanelId = 0;
			for (var i = 0; i < groupOfGroupsList.length; i++) {
				this._addGroupOfGroupsToDom(groupOfGroupsList[i]);
			}
		},
		
		_createDefaultStructure: function() {
			var panelElements = this.element.children("div");
			var panels = [];
			panelElements.each(function() {
				panels.push({
					id: $(this).attr("id")
				});
			});
			
			var group = {
				panels: panels
			};
			
			if (panels.length > 0) {
				group.openPanel = panels[0].id
			}
			
			return [{
				groups: [group]
			}];
		},
		
		_addGroupOfGroupsToDom: function(groupOfGroupsStructure) {
			var groupOfGroupsElement = $(document.createElement("ul"));
			groupOfGroupsElement.attr("data-panels-id", this.nextGroupOfGroupsId++);
			
			groupOfGroupsElement.addClass("panel-group-of-groups");
			if (groupOfGroupsStructure.classes) {
				groupOfGroupsElement.addClass(groupOfGroupsStructure.classes);
			}
			
			groupOfGroupsStructure.internal = {
				type: "groupOfGroups",
				element: groupOfGroupsElement
			};
			
			var groups = groupOfGroupsStructure.groups;
			for (var i = 0; i < groups.length; i++) {
				this._addGroupToDom(groups[i], groupOfGroupsStructure);
			}
			
			if (this.options.groupsSortable) {
				this._addSortableToGroups(groupOfGroupsStructure);
			}
			
			this.element.parent().append(groupOfGroupsElement);
		},
		
		_addGroupToDom: function(groupStructure, parentStructure) {
			var groupElement = $(document.createElement("li"));
			groupElement.attr("data-panels-id", this.nextGroupId++);
			
			groupElement.addClass("panel-group");
			if (groupStructure.classes) {
				groupElement.addClass(groupStructure.classes);
			}
			
			parentStructure.internal.element.append(groupElement);
			
			var tabBar = $(document.createElement("div"));
			tabBar.addClass("panel-tabs-bar");
			groupElement.append(tabBar);
			
			var groupTabsElement = $(document.createElement("ul"));
			groupTabsElement.addClass("panel-tabs");
			tabBar.append(groupTabsElement);
			
			groupStructure.internal = {
				type: "group",
				element: groupElement,
				tabsElement: groupTabsElement,
				parentStructure: parentStructure
			};
			
			var panels = groupStructure.panels;
			for (var i = 0; i < panels.length; i++) {
				this._addPanelToDom(panels[i], groupStructure);
			}
			
			if (this.options.panelsSortable) {
				var sortableHandle = $(document.createElement("span"));
				sortableHandle.addClass("ui-icon ui-icon-grip-dotted-vertical panel-group-handle");
				groupTabsElement.after(sortableHandle);
				var clearElement = $(document.createElement("div"));
				clearElement.css("clear", "both");
				sortableHandle.after(clearElement);
				this._addSortableToPanels(groupStructure);
			}
			
			var resizable = parentStructure.resizable;
			if (resizable) {
				this._addResizableToPanels(groupStructure, resizable);
			}
			
			if (groupStructure.openPanel) {
				this.openPanel(groupElement.find("#" + groupStructure.openPanel));
			}
		},

		_addPanelToDom: function(panelStructure, parentStructure) {
			var self = this;
			
			var panelElement = this.element.children("#" + panelStructure.id);
			panelElement.attr("data-panels-id", this.nextPanelId++);
			
			panelElement.addClass("panel");
			if (panelStructure.panelClasses) {
				panelElement.addClass(panelStructure.panelClasses);
			}
			
			parentStructure.internal.element.append(panelElement);
			
			var tabElement = this.providedTabList.children('li').find('a[href="#' + panelStructure.id + '"]').closest("li");
			tabElement.addClass("panel-tab");
			if (panelStructure.tabClasses) {
				tabElement.addClass(panelStructure.tabClasses);
			}
			
			parentStructure.internal.tabsElement.append(tabElement);
			tabElement.click(function() {
				self.togglePanel(panelElement);
			});
			
			panelStructure.internal = {
				type: "panel",
				panelElement: panelElement,
				tabElement: tabElement,
				parentStructure: parentStructure
			};
		},
		
		_addSortableToGroups: function(groupOfGroupsStructure) {
			var self = this;
			groupOfGroupsStructure.internal.element.sortable({
				connectWith: ".panel-group-of-groups",
				placeholder: "ui-state-highlight",
				handle: ".panel-group-handle",
				stop: function(event, ui) {
					var groupElement = ui.item.closest(".panel-group");
					
					var groupStructure = self._getStructureByElement(groupElement);
					if (groupStructure) {
						var oldGroupOfGroups = groupStructure.internal.parentStructure.internal.element;
						var newGroupOfGroups = groupElement.closest(".panel-group-of-groups");
						
						var index = groupElement.index();
						
						if (oldGroupOfGroups.get(0) == newGroupOfGroups.get(0)) {
							//group was moved within the same group of groups
							self.moveGroupToGroupOfGroups(groupElement, newGroupOfGroups, index);
						} else {
							//group was moved to a new group of groups
							self.moveGroupToGroupOfGroups(groupElement, newGroupOfGroups, index);
						}
					}
				}
			}).disableSelection();
		},
		
		_addSortableToPanels: function(groupStructure) {
			var self = this;
			
			var connectWith = ".panel-tabs";
			if (this.options.groupsSortable) {
				connectWith += ", .panel-group-of-groups"
			}
			
			groupStructure.internal.tabsElement.sortable({
				connectWith: connectWith,
				placeholder: "ui-state-highlight",
				stop: function(event, ui) {
					var tabElement = ui.item.closest(".panel-tab");
					var panelElementSelector = tabElement.find("a").attr("href");
					var panelElement = $(panelElementSelector)
					var panelStructure = self._getStructureByElement(panelElement);
					if (panelStructure) {
						var oldGroup = panelStructure.internal.parentStructure.internal.element;
						var newGroup = tabElement.closest(".panel-group");
						
						var index = tabElement.index();
						
						if (newGroup.length > 0 && newGroup.get(0) == oldGroup.get(0)) {
							//panel was moved within the same group
							self.movePanelToGroup(panelElement, newGroup, index)
						} else if (newGroup.length > 0 && newGroup.get(0) != oldGroup.get(0)) {
							//panel was moved to a new group
							self.movePanelToGroup(panelElement, newGroup, index)
						} else if (newGroup.length == 0) {
							//panel was moved to create a new group
							var groupOfGroupsElement = tabElement.closest(".panel-group-of-groups");
							self.movePanelToGroupOfGroups(panelElement, groupOfGroupsElement, index)
						}
					}
				}
			}).disableSelection();
		},
		
		_addResizableToPanels: function(groupStructure, resizableOptions) {
			var self = this;
			
			var panelElementSelector = ".panel-group[data-panels-id='" + groupStructure.internal.element.attr("data-panels-id") + "'] .panel.panel-open";
			groupStructure.internal.element.resizable({
				alsoResize: panelElementSelector,
				handles: resizableOptions.handles ? 
						resizableOptions.handles : "",
				start: function(event, ui) {
					var otherPanelsInGroupOfGroups = groupStructure.internal.parentStructure.internal.element.find(".panel");
					var currentResizingPanel = $(".panel-group[data-panels-id='" + groupStructure.internal.element.attr("data-panels-id") + "'] .panel.panel-open");
					otherPanelsInGroupOfGroups.each(function() {
						var otherPanel = $(this);
						if (currentResizingPanel.get(0) != otherPanel.get(0)) {
							if (resizableOptions.clearWidthForOtherPanels) {
								otherPanel.css("width", "");
							}
						}
					});
				},
				resize: function(event, ui) {
					ui.element.css("width", "");
					ui.element.css("height", "");
					ui.element.css("top", "");
					ui.element.css("left", "");
				},
				stop: function(event, ui) {
					ui.element.css("width", "");
					ui.element.css("height", "");
					ui.element.css("top", "");
					ui.element.css("left", "");
					
					self._trigger("panelResized", {
						panelElement: $(panelElementSelector)
					});
				}
			});
		},
		
		_removeResizableFromPanels: function(groupStructure) {
			try {
				groupStructure.internal.element.resizable("destroy");
				groupStructure.internal.element.find(".panel").each(function() {
					var panel = $(this);
					panel.css("width", "");
					panel.css("height", "");
				});
			} catch(err) {
				//An error will be thrown if resizable hasn't been initialized. In that case,
				//we don't want to do anything.
			}
		},
		
		_destroy: function() {
			var groupOfGroupsList = this.structure;
			for (var i = 0; i < groupOfGroupsList.length; i++) {
				this._destoryGroupOfGroups(groupOfGroupsList[i]);
			}
			
			this.element.prepend(this.providedTabList);
		},
		
		_destoryGroupOfGroups: function(groupOfGroupsStructure) {
			var groups = groupOfGroupsStructure.groups;
			for (var i = 0; i < groups.length; i++) {
				this._destoryGroup(groups[i]);
			}
			
			groupOfGroupsStructure.internal.element.remove();
		},
		
		_destoryGroup: function(groupStructure) {
			var panels = groupStructure.panels;
			for (var i = 0; i < panels.length; i++) {
				this._destoryPanel(panels[i]);
			}
			
			groupStructure.internal.element.remove();
		},
		
		_destoryPanel: function(panelStructure) {
			this.element.append(panelStructure.internal.panelElement);
			this.providedTabList.append(panelStructure.internal.tabElement);
			
			//Remove classes, styles, and attributes from panelElement
			panelStructure.internal.panelElement
				.removeClass("panel")
				.removeClass("panel-open")
				.removeAttr("data-panels-id")
				.css("width", "")
				.css("height", "");
			
			//Remove classes, styles, and attributes from tabElement
			panelStructure.internal.tabElement
				.removeClass("panel-tab")
				.removeClass("panel-open");
		},
		
		/**
		 * Returns an array with objects representing how the panels should be laid out.
		 * You can use this structure to initialize the panels widget, and you can save
		 * this structure if you want to keep track of how a user laid out their panels.
		 */
		exportStructure: function() {
			var structureToReturn = [];
			for (var i = 0; i < this.structure.length; i++) {
				var structure = {};
				this._exportStructureHelper(structure, this.structure[i]);
				structureToReturn.push(structure);
			}
			return structureToReturn;
		},
		
		_exportStructureHelper: function(structure, referenceStructure) {
			for (var prop in referenceStructure) {
				if (referenceStructure[prop] instanceof Array) {
					structure[prop] = [];
					for (var i = 0; i < referenceStructure[prop].length; i++) {
						var tempStructure = {};
						this._exportStructureHelper(tempStructure, referenceStructure[prop][i]);
						structure[prop].push(tempStructure);
					}
				} else if (prop != "internal") {
					structure[prop] = referenceStructure[prop]
				}
			}
		},
		
		/**
		 * Takes an element and tries to find the structure object representing that element.
		 */
		_getStructureByElement: function(element) {
			return this._getStructureByElementHelper(element, this.structure);
		},
		
		_getStructureByElementHelper: function(element, structureToSearch) {
			for (var i = 0; i < structureToSearch.length; i++) {
				var elementToCompare = null;
				var nextArrayToSearch = null;
				if (structureToSearch[i].internal) {
					if (structureToSearch[i].internal.type == "groupOfGroups") {
						elementToCompare = structureToSearch[i].internal.element;
						nextArrayToSearch = structureToSearch[i].groups;
					} else if (structureToSearch[i].internal.type == "group") {
						elementToCompare = structureToSearch[i].internal.element;
						nextArrayToSearch = structureToSearch[i].panels;
					} else if (structureToSearch[i].internal.type == "panel") {
						elementToCompare = structureToSearch[i].internal.panelElement;
					}
					
					if (elementToCompare && elementToCompare.get(0) == element.get(0)) {
						return structureToSearch[i];
					} else if (nextArrayToSearch) {
						var resultFromNextArray = this._getStructureByElementHelper(element, nextArrayToSearch);
						if (resultFromNextArray) {
							return resultFromNextArray;
						}
					}
				}
			}
			
			return null;
		},
		
		/**
		 * Opens the given panel element.
		 * @param {jQuery} panelElement The element representing the panel.
		 */
		openPanel: function(panelElement) {
			var panelStructure = this._getStructureByElement(panelElement);
			if (panelStructure && panelStructure.internal.type == "panel") {
				this._openPanel(panelStructure);
			}
		},
		
		_openPanel: function(panelStructure) {
			this._closeOpenPanelInGroup(panelStructure.internal.parentStructure);
			
			panelStructure.internal.parentStructure.openPanel = panelStructure.id;
			panelStructure.internal.panelElement.addClass("panel-open");
			panelStructure.internal.tabElement.addClass("panel-open");
			
			this._trigger("panelOpened", null, {
				panelElement: panelStructure.internal.panelElement
			});
		},
		
		_closeOpenPanelInGroup: function(groupStructure) {
			if (groupStructure.openPanel) {
				var openPanelElement = $("#" + groupStructure.openPanel);
				this.closePanel(openPanelElement);
			}
		},
		
		/**
		 * Closes the given panel element.
		 * @param {jQuery} panelElement The element representing the panel.
		 */
		closePanel: function(panelElement) {
			var panelStructure = this._getStructureByElement(panelElement);
			if (panelStructure && panelStructure.internal.type == "panel") {
				this._closePanel(panelStructure);
			}
		},
		
		_closePanel: function(panelStructure) {
			if (panelStructure.internal.parentStructure.openPanel == panelStructure.id) {
				panelStructure.internal.panelElement.removeClass("panel-open");
				panelStructure.internal.tabElement.removeClass("panel-open");
				panelStructure.internal.parentStructure.openPanel = null;
				
				this._trigger("panelClosed", null, {
					panelElement: panelStructure.internal.panelElement
				});
			}
		},
		
		/**
		 * Returns true if the given panel element is open, false otherwise.
		 * @param {jQuery} panelElement The element representing the panel.
		 * @return {boolean} True if the panel is open, false otherwise.
		 */
		isPanelOpen: function(panelElement) {
			var panelStructure = this._getStructureByElement(panelElement);
			if (panelStructure && panelStructure.internal.type == "panel") {
				this._isPanelOpen(panelStructure);
			}
		},
		
		_isPanelOpen: function(panelStructure) {
			return panelStructure.internal.parentStructure.openPanel &&
				panelStructure.internal.parentStructure.openPanel.length > 0 &&
				panelStructure.internal.parentStructure.openPanel == panelStructure.id
		},
		
		/**
		 * If the given panel element is open, it will close the panel. Otherwise,
		 * it will open the panel.
		 * @param {jQuery} panelElement The element representing the panel.
		 */
		togglePanel: function(panelElement) {
			var panelStructure = this._getStructureByElement(panelElement);
			if (panelStructure && panelStructure.internal.type == "panel") {
				this._togglePanel(panelStructure);
			}
		},
		
		_togglePanel: function(panelStructure) {
			if (this._isPanelOpen(panelStructure)) {
				this._closePanel(panelStructure);
			} else {
				this._openPanel(panelStructure);
			}
		},
		
		/**
		 * Moves the panel element to the group element and inserts
		 * the panel's tab at the given index.
		 * @param {jQuery} panelElement The element representing the panel.
		 * @param {jQuery} groupElement The element representing the group.
		 * @param {number} index The index which the panel's tab should be inserted. If null,
		 * 	it will append the tab to the end.
		 */
		movePanelToGroup: function(panelElement, groupElement, index) {
			var panelStructure = this._getStructureByElement(panelElement);
			var groupStructure = this._getStructureByElement(groupElement);
			if (panelStructure && panelStructure.internal.type == "panel" &&
					groupStructure && groupStructure.internal.type == "group") {
				this._movePanelToGroup(panelStructure, groupStructure, index);
			}
		},
		
		_movePanelToGroup: function(panelStructure, groupStructure, index) {
			var oldGroupStructure = panelStructure.internal.parentStructure;
			var oldGroupOfGroupsStructure = oldGroupStructure.internal.parentStructure;
			var oldIndex = -1;
			for (var i = 0; i < oldGroupStructure.panels.length; i++) {
				if (oldGroupStructure.panels[i] == panelStructure) {
					oldIndex = i;
				}
			}
			
			if (oldGroupStructure != groupStructure || index != oldIndex) {
				this._removePanelFromGroup(panelStructure);
				this._addPanelToGroup(panelStructure, groupStructure, index);
				this._trigger("panelMoved", null, {
					panelElement: panelStructure.internal.panelElement,
					oldGroupElement: oldGroupStructure.internal.element,
					newGroupElement: groupStructure.internal.element,
					oldGroupOfGroupsElement: oldGroupOfGroupsStructure.internal.element,
					newGroupOfGroupsElement: groupStructure.internal.parentStructure.internal.element
				});
			}
		},
		
		_removePanelFromGroup: function(panelStructure) {
			if (this._isPanelOpen(panelStructure)) {
				this._closePanel(panelStructure);
			}
			
			var groupStructure = panelStructure.internal.parentStructure;
			for (var i = 0; i < groupStructure.panels.length; i++) {
				if (groupStructure.panels[i] == panelStructure) {
					groupStructure.panels.splice(i, 1);
					break;
				}
			}
			
			panelStructure.internal.tabElement.detach();
			panelStructure.internal.panelElement.detach();
			
			panelStructure.internal.parentStructure = null;
			
			//Remove groups that no longer have any panels
			if (groupStructure.panels.length == 0) {
				this._removeGroupFromGroupOfGroups(groupStructure);
				groupStructure.internal.element.remove();
				groupStructure.internal.element = null;
			}
		},
		
		_addPanelToGroup: function(panelStructure, groupStructure, index) {
			if (index != null && (index < 0 || index > groupStructure.panels.length - 1)) {
				index = null;
			}
			
			if (index != null) {
				groupStructure.panels.splice(index, 0, panelStructure);
				$(groupStructure.internal.element.children(".panel").get(index)).before(panelStructure.internal.panelElement);
				$(groupStructure.internal.tabsElement.children("li").get(index)).before(panelStructure.internal.tabElement);
			} else {
				groupStructure.panels.push(panelStructure);
				groupStructure.internal.element.append(panelStructure.internal.panelElement);
				groupStructure.internal.tabsElement.append(panelStructure.internal.tabElement)
			}
			
			panelStructure.internal.parentStructure = groupStructure;
			
			panelStructure.internal.panelElement.css("width", "");
			panelStructure.internal.panelElement.css("height", "");
			
			if (this.options.openPanelOnAdd) {
				this._openPanel(panelStructure);
			}
		},
		
		/**
		 * Inserts the group element into the group of groups element at the given index.
		 * @param {jQuery} groupElement The element representing the group.
		 * @param {jQuery} groupOfGroupsElement The element representing the group of groups.
		 * @param {number} index The index to insert the group element into. If null, the group will
		 * 	be appended to the end.
		 */
		moveGroupToGroupOfGroups: function(groupElement, groupOfGroupsElement, index) {
			var groupStructure = this._getStructureByElement(groupElement);
			var groupOfGroupsStructure = this._getStructureByElement(groupOfGroupsElement);
			if (groupStructure && groupStructure.internal.type == "group" &&
					groupOfGroupsStructure && groupOfGroupsStructure.internal.type == "groupOfGroups") {
				this._moveGroupToGroupOfGroups(groupStructure, groupOfGroupsStructure, index);
			}
		},
		
		_moveGroupToGroupOfGroups: function(groupStructure, groupOfGroupsStructure, index) {
			var oldGroupOfGroupsStructure = groupStructure.internal.parentStructure;
			var oldIndex = -1;
			for (var i = 0; i < oldGroupOfGroupsStructure.groups.length; i++) {
				if (oldGroupOfGroupsStructure.groups[i] == groupStructure) {
					oldIndex = i;
				}
			}
			
			if (oldGroupOfGroupsStructure != groupOfGroupsStructure || index != oldIndex) {
				this._removeGroupFromGroupOfGroups(groupStructure);
				this._addGroupToGroupOfGroups(groupStructure, groupOfGroupsStructure, index);
				this._trigger("panelGroupMoved", null, {
					groupElement: groupStructure.internal.element,
					oldGroupOfGroupsElement:oldGroupOfGroupsStructure.internal.element,
					newGroupOfGroupsElement: groupOfGroupsStructure.internal.element
				});
			}
		},
		
		_removeGroupFromGroupOfGroups: function(groupStructure) {
			var groupOfGroupsStructure = groupStructure.internal.parentStructure;
			for (var i = 0; i < groupOfGroupsStructure.groups.length; i++) {
				if (groupOfGroupsStructure.groups[i] == groupStructure) {
					groupOfGroupsStructure.groups.splice(i, 1);
					break;
				}
			}
			
			groupStructure.internal.element.detach();
			
			groupStructure.internal.parentStructure = null;
		},
		
		_addGroupToGroupOfGroups: function(groupStructure, groupOfGroupsStructure, index) {
			if (index != null && (index < 0 || index > groupOfGroupsStructure.groups.length - 1)) {
				index = null;
			}
			
			if (index != null) {
				groupOfGroupsStructure.groups.splice(index, 0, groupStructure);
				$(groupOfGroupsStructure.internal.element.children("li").get(index)).before(groupStructure.internal.element);
			} else {
				groupOfGroupsStructure.groups.push(groupStructure);
				groupOfGroupsStructure.internal.element.append(groupStructure.internal.element);
			}
			
			groupStructure.internal.parentStructure = groupOfGroupsStructure;
			
			this._removeResizableFromPanels(groupStructure);
			
			if (groupOfGroupsStructure.resizable) {
				this._addResizableToPanels(groupStructure, groupOfGroupsStructure.resizable);
			}
		},
		
		/**
		 * Inserts the panel element into the group of groups element at the given index. A new group element
		 * will automatically be created to hold the panel element.
		 * @param {jQuery} panelElement The element representing the panel.
		 * @param {jQuery} groupOfGroupsElement The element representing the group of groups.
		 * @param {number} index The index to insert the panel's new group element into. If null, the group will
		 * 	be appended to the end.
		 */
		movePanelToGroupOfGroups: function(panelElement, groupOfGroupsElement, index) {
			var panelStructure = this._getStructureByElement(panelElement);
			var groupOfGroupsStructure = this._getStructureByElement(groupOfGroupsElement);
			if (panelStructure && panelStructure.internal.type == "panel" &&
					groupOfGroupsStructure && groupOfGroupsStructure.internal.type == "groupOfGroups") {
				this._movePanelToGroupOfGroups(panelStructure, groupOfGroupsStructure, index);
			}
		},
		
		_movePanelToGroupOfGroups: function(panelStructure, groupOfGroupsStructure, index) {
			var oldGroupStructure = panelStructure.internal.parentStructure;
			var oldGroupOfGroupsStructure = oldGroupStructure.internal.parentStructure;
			this._removePanelFromGroup(panelStructure);
			var newGroupStructure = this._addNewGroup(groupOfGroupsStructure, index);
			this._addPanelToGroup(panelStructure, newGroupStructure, index);
			this._trigger("panelMoved", null, {
				panelElement: panelStructure.internal.panelElement,
				oldGroupElement: oldGroupStructure.internal.element,
				newGroupElement: newGroupStructure.internal.element,
				oldGroupOfGroupsElement: oldGroupOfGroupsStructure.internal.element,
				newGroupOfGroupsElement: groupOfGroupsStructure.internal.element
			});
		},
		
		_addNewGroup: function(groupOfGroupsStructure, index) {
			var newGroupStructure = {
				panels: []
			};
			
			this._addGroupToDom(newGroupStructure, groupOfGroupsStructure);
			this._addGroupToGroupOfGroups(newGroupStructure, groupOfGroupsStructure, index);
			return newGroupStructure;
		}
	}); 
})(jQuery); 