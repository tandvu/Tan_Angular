'use strict';

/* Controllers */

var managerControllers = angular.module('managerControllers', ['ngGrid']);

managerControllers.controller('TemplateListCtrl', ['$scope', '$http', 'Template', 'VM', 'DeployTemplate', 'StartVM', 'StopVM',
  function($scope, $http, Template, VM, DeployTemplate, StartVM, StopVM) {

	/* General TODO: Currently the views aren't always synchronized with the data. Probably want to switch to a method
	 *  that allows the views to stay synchronized.
	 */ 
	
    /* requeryTemplates() - Query for the templates from the database. Called on page load and when refreshing the view.
     */
    
    $scope.requeryTemplates = function() {
        $http.get("/VmTemplates").success(function(data) {
    	    $scope.templates = data._collectiondata;
        });
    }
    
    $scope.requeryTemplates();
       
    /* requeryExerciseVMs() - Query for the VM list for the selected trainingEvent from the database. 
     *  Called on page load and when refreshing the view.
     */
            
    $scope.requeryExerciseVMs = function($event) {
    	var event = $event;
    	if (event) {
    		event.target.src = "img/waiting.gif";
    	}
  
    	if ($scope.trainingEvent) {
	    	$http.get('/TrngEventVirtualSystems/' + $scope.trainingEvent.name).success(function(data) {
				$scope.exercisevms = data._collectiondata;
				if (event) {
					event.target.src = "img/reload.jpg";
				}
			});
    	}
   	}

    /* requeryVMs() - Query for the VM list for the selected trainingEvent from the database. 
     *  Called on page load and when refreshing the view.
     */
   	    
    $scope.requeryVMs = function($event) {
    	
    	// TODO: Fix this waiting icon - currently it does not use the animated gif but instead stays with the original image. 
    	
    	var event = $event;
    	if (event) {
    		event.target.src = "img/waiting.gif";
    	}

		/* For each VM in the database, check its id against the VM list coming from the VirtualizationManager. 
		 * Only add the VM to the list there is a match.
		 */ 
		
    	if ($scope.trainingEvent) {
	    	$http.get('/TrngEventVirtualSystems/' + $scope.trainingEvent.name).success(function(trainingEventVirtualMachines) {
				$scope.exercisevms = trainingEventVirtualMachines._collectiondata;
				$http.get('/VirtualizationManager/user/virtualMachines').success(function(virtualMachines) {
					$scope.vms = [];
					for (var i in virtualMachines) {
						for (var j in $scope.exercisevms) {
							
							// Match using unique cloud id - checks datacenter, host, and name 
							
							// if (virtualMachines[i].id == $scope.exercisevms[j].unique_cloud_vm_id) {
								// $scope.vms.push(virtualMachines[i]);
							// }
							
							// Match using just name. Should be unique anyways since VMware enforces unique VM names.
							if (virtualMachines[i].name == $scope.exercisevms[j].name) {
								$scope.vms.push(virtualMachines[i]);
							}
						}
					}
				});
			});
    	}
    }

    /* requeryTrainingEvents() - Query training events from the database and select the first entry (if available). Then
     *  query for ExerciseVMs and VMs based on the event selected.
     *
     *  Called on page load.
     */
    
    $scope.requeryTrainingEvents = function() {  	
    	
    	$http.get('http://msco-vmf.sd.spawar.navy.mil/TrainingEvents').success(function(data) {
			$scope.trainingEvents = data._collectiondata;
			if (data._collectiondata) {
				$scope.trainingEvent = $scope.trainingEvents[0];
			}
			
			$scope.requeryExerciseVMs();
			$scope.requeryVMs();
		});
   	}
   	    
    $scope.requeryTrainingEvents();


    /* startVM() - start a VM via the Virtualization Service 
     */
    
    $scope.startVM = function(id) {	
		$http.put("/VirtualizationManager/admin/startVM/" + id).success(function(data) {
			$scope.requeryVMs();
		});
	}

    /* stopVM() - stop a VM via the Virtualization Service 
     */
	
	$scope.stopVM = function(id) {	
		$http.put("/VirtualizationManager/admin/stopVM/" + id).success(function(data) {
			$scope.requeryVMs();
		});
	}
	
	/* suspendVM() - suspend/pause a VM via the Virtualization Service 
     */
    
	$scope.suspendVM = function(id) {	
		$http.put("/VirtualizationManager/admin/suspendVM/" + id).success(function(data) {
			$scope.requeryVMs();
		});
	}
	
	/* provisionVM() - stage a VM for provisioning from a template via the Virtualization Service.
     */
	
	$scope.provisionVM = function() {
	
		// Get parameters from selected template and use them to fill in the parameters for the VM to be instantiated.
	
		if ($scope.templateGridOptions.selectedItems[0]) {
			
			var systemName = $scope.templateGridOptions.selectedItems[0].system;
			var systemDescription = $scope.templateGridOptions.selectedItems[0].description;
			var systemVersion = $scope.templateGridOptions.selectedItems[0].system_version;
			var templateUri = $scope.templateGridOptions.selectedItems[0].template_uri;
	
   			if ($scope.trainingEvent) {

	   			$http.get('/TrngEventVirtualSystems/' + $scope.trainingEvent.name).success(function(trainingEventVirtualMachinesCollection) {

					/* Attempt to ensure VM name is unique within the Virtualization Technology (since some providers enforce uniquness) 
					 *  Prepend the training event name, then add the system name. Append a number if necessary.
					 * */

					var vmFullName = $scope.trainingEvent.name + "_" + systemName;
   					var vmName = $scope.trainingEvent.name + "_" + systemName;
 					var vmNum = 0;
 					var vmNameIsUnique = 'no';
 					while (vmNameIsUnique == 'no') {	 
	 	   				var foundMatch = 'no';  				
	 	   				var trainingEventVirtualMachines = trainingEventVirtualMachinesCollection._collectiondata;
	   					for (var i in trainingEventVirtualMachines) {
	   						if (trainingEventVirtualMachines[i].name == vmFullName) {
	   							foundMatch = 'yes';
	   							vmFullName = vmName + "-" + vmNum;
	   							vmNum++;
	   							break;
	   						}
	   					}
	   					if (foundMatch == 'no') {
	   						vmNameIsUnique = 'yes';
	   					}
	   				}
	   			
	   				// TODO: Get VLAN value from database rather than hard coding it.
	   			
		   			var staticData = {
						name: vmFullName,
						system_name: systemName,
						description: systemDescription,
						version: systemVersion,
						unique_cloud_vm_id:"",
						VLAN:"21",
						template_uri: templateUri,
						properties:"",
						deployment_status:"undeployed"
					}

					$http.post("/TrngEventVirtualSystem/" + $scope.trainingEvent.name, staticData).success(function(data) {
						$scope.requeryExerciseVMs();
					});		
	   			});
			}
		}
	}
	
	/* deployVM() - provision a VM that has been previously staged for provisioning. The provisioning occurs via the Virtualization Service.
     */
	
	$scope.deployVM = function(vmName, templateUri, databaseURL) {
		
		/* TODO: This ID is the one that the nm.php script generates. We are probably going to change the way this is done in the 
		 *  (hopefully near) future, so this code will need to change at that point.
		 */
		
		var databaseID = databaseURL.substring(databaseURL.lastIndexOf("/") + 1)
		beginProvisioning($scope, vmName, templateUri, databaseID);
	}
	
	/* updateVM() - update the deployed VM status in the view and requery VMs for the current exercise.
     */
	
	$scope.updateVM = function(databaseID, uniqueVMid) {
		if ($scope.trainingEvent) {
	    	$http.get('/TrngEventVirtualSystem/' + $scope.trainingEvent.name + "/" + databaseID).success(function(data) {

	    		data.deployment_status = "deployed";
	    		data.unique_cloud_vm_id = uniqueVMid.replace("datacenter-2102", "MSCO-Test");
	    		data.url = "";
	    		data.time = "";
	    		
	    		$http.put('/TrngEventVirtualSystem/' + $scope.trainingEvent.name + "/" + databaseID, data).success(function(result) {
	    			$scope.requeryExerciseVMs();
	    		});
	    	});
	    }
	}
         
    /* openConsole() - open a viewer that shows an HTML based display to the user for the chosen VM.
     */
         
    $scope.openConsole = function(vmName) {
    	        
        launchViewer(vmName);
    };

	// Grid options for template list within Template view
	
    $scope.templateGridOptions = { 
        data: 'templates',
        multiSelect: false,
	    columnDefs: [
            {field: 'system', displayName: 'System'},
            {field: 'system_version', displayName: 'Version'},
            {field: 'template_name', displayName: 'Template'},
            {field: 'description', displayName: 'Description'},
            {field: 'time', displayName: 'UploadDate'},
        ],
        selectedItems: []
    };
    
    // Grid options for VM list VM View
        
    $scope.vmGridOptions = { 
        data: 'vms',
	    enableRowSelection: false,
	    sortInfo: {fields: ['name'], directions: ['asc']},
        columnDefs: [
            {field: 'name', displayName: 'System'},
            {field: 'running_status', displayName: 'RunningStatus'},
            {displayName: 'Options', cellTemplate: 'partials/cell-template.html'}
        ]
    };
    
    // Grid options for VM list within Template view
    
    $scope.exerciseVMGridOptions = { 
        data: 'exercisevms',
	    enableRowSelection: false,
	   	sortInfo: {fields: ['name'], directions: ['asc']},
        columnDefs: [
            {field: 'name', displayName: 'Name', width: "***"},
            {field: 'system_name', displayName: 'System', width: "*"},
            {field: 'description', displayName: 'Description', width: "*"},
            {field: 'version', displayName: 'Version', width: "*"},
            {field: 'deployment_status', displayName: 'Status', width: "*"},
            {displayName: 'Options', cellTemplate: 'partials/exercisevm-cell-template.html', width: "*"}
        ]
    };
    
  }]);