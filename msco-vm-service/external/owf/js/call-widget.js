
function launchViewer(vmName) {

	/* TODO: Add in logic to check to see if we are in an OWF context or not. If not, use the window.open function to open a new 
	 *  browser window rather than attempting to launch an OWF widget.
	 */

   	// TODO: The first part of this URL should be pulled from a configuration file.	
    // window.open("http://msco-guacamole.sd.spawar.navy.mil/guacamole/client.xhtml?id=c/" + vmName);

	// TODO: move this into an init function
	OWF.relayFile = "js/eventing/rpc_relay.uncompressed.html";
	
	var vmNameJSON = {vmName: vmName};
	
	// TODO: Remove data field or set it to empty string (no longer needed)
	
	// TODO: Replace hard coded guid with a function to lookup the guid from the widget name?
	
	OWF.Launcher.launch({
		guid: "16dd3805-8ff9-42ee-a72d-3f79b44890b8",
		launchOnlyIfClosed: false,
		title: "VM Viewer - " + vmName,
		data : Ozone.util.toString(vmNameJSON)
	});
}

function launchJMMJMTLibrary() {
	
	// TODO: move this into an init function
	OWF.relayFile = "js/eventing/rpc_relay.uncompressed.html";
	
	OWF.Launcher.launch({
		guid: "4cc44d0a-2d78-4ea1-8101-3dba96bef439",
		launchOnlyIfClosed: true,
		title: "JMM/JMT Library"
	});
}