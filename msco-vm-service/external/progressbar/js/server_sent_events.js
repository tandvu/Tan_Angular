/*
 * updateProgressMeter - Update the width of the progress bar and the numeric value of the progress on the view.
 *  I am intentionally not using HTML5 progress tag, as its implementation is completely up to the browser vendor.
 *  This div based method does is browser independent. 
 */

var stagesProgressCompletionPercentage;
var percentagePerStage;

function updateProgressMeter(progress) {
	
	var progressCompletionPercentage = stagesProgressCompletionPercentage + (progress * percentagePerStage / 100); 
    $('#progressbar').width(progressCompletionPercentage + '%');
    $('.progress-value').html(progressCompletionPercentage + '%');
	console.log("ProgressMeter: " + progressCompletionPercentage + ", (progress = " + progress + ", percentagePerStage = " + percentagePerStage + ", totalPercentFromCurrentStage = " + (progress * percentagePerStage / 100) + ")");
}

function updateProgressStageMeter(progress) {
	
	// Format: "Stage xx of yy: Completed"
	// In this format, xx and yy are integers
	
	if (progress.toLowerCase().indexOf("started") > 0) {
		var stringTokens = progress.toLowerCase().split(" ");
		var startStage = parseInt(stringTokens[1]);
		var endStage = parseInt(stringTokens[3].split(":")[0]);
		stagesProgressCompletionPercentage = 100 * (startStage - 1) / endStage;
		percentagePerStage = 100 / endStage;
	    $('#progressbar').width(stagesProgressCompletionPercentage + '%');
	    $('.progress-value').html(stagesProgressCompletionPercentage + '%');	
		console.log("StageProgressMeter: " + stagesProgressCompletionPercentage);
	}
	else if (progress.toLowerCase().indexOf("completed") > 0) {
		var stringTokens = progress.toLowerCase().split(" ");
		var completedStage = parseInt(stringTokens[1]);
		var endStage = parseInt(stringTokens[3].split(":")[0]);
		stagesProgressCompletionPercentage = 100 * (completedStage) / endStage;
		percentagePerStage = 100 / endStage;
	    $('#progressbar').width(stagesProgressCompletionPercentage + '%');
	    $('.progress-value').html(stagesProgressCompletionPercentage + '%');	
		console.log("StageProgressMeter: " + stagesProgressCompletionPercentage);
	}
}

/* 
 * beginProvisioning - provision a VM using event based listeners. This allows us to update the view dynamically and keep the 
 *  user appraised of the progress. 
 */

function beginProvisioning() {
			
	// TODO: separate the call from the view and event listener logic.
	
	$('.progress-waiting').css("display", "block");
	$('.progress-wrapper').css("display", "none");
	$('.progress-value').html('Please wait.');		
			
	if (typeof(EventSource) !== "undefined") {
		
//		var source = new EventSource("/VirtualizationManager/api/createVirtualEntity/Second");
//		var source = new EventSource("/VirtualizationManager/api/renameVirtualEntity/Second/Renamed");
		var source = new EventSource("/VirtualizationManager/api/provisionVm/Second/Windows2012/Windows_2012_With_Networking/vlans=Org");
//		var source = new EventSource("/VirtualizationManager/api/provisionVm/First/Windows2012Duo/Windows_2012_GuestCustomizationsON_AutoLogonON/vlans=Db,Org");
//		var source = new EventSource("/VirtualizationManager/api/deleteVirtualEntities/Third");	   
		
		source.addEventListener('provisionstart', function(event) {
		   $('.progress-waiting').css("display", "none");
		   $('.progress-wrapper').css("display", "block");
		   $('.progress-value').html(event.data);	
		   console.log("In provisionstart listener: " + event.data);
		}, false);	 
			   
		source.addEventListener('provisionend', function(event) {
		   $('.progress-wrapper').css("display", "none");
		   console.log("In provisionend listener: " + event.data);
		}, false);	 

		source.addEventListener('provisionedfile', function(event) {
		   console.log("Provisioned file: " + event.data);
		}, false);	
			   
		source.addEventListener('apperror', function(event) {
		   $('.progress-value').html("Error: " + event.data);
		   console.log("In apperror listener: " + event.data);
		}, false);	 
			   
		source.addEventListener('progress', function(event) {
		   console.log("In progress listener: " + event.data);
		   updateProgressMeter(event.data);
		}, false);	 
		
		source.addEventListener('progressStage', function(event) {
			console.log("In progressStage listener: " + event.data);
			updateProgressStageMeter(event.data);
		}, false);	 
		
		source.addEventListener('completed', function(event) {
			   console.log("In completed listener: " + event.data);
			}, false);

		source.onopen = function (event) { 
		   console.log("opened");
		};
			 
		source.onerror = function (event) {
		   console.log("Got an error, ready state: " + source.readyState);
		   source.close();
		};
		 
		source.onmessage = function (event) {
//		   $('.progress-waiting').css("display", "none");
//		   $('.progress-wrapper').css("display", "block");
//		   $('.progress-value').html("SSE: " + event.data);	
		   console.log("SSE: " + event.data);
		};
	}	
	else {
	    alert ("Sorry! No server-sent events support..");
	}	 	 
		 	 
}