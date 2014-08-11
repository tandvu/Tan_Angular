/*
 * updateProgressMeter - Update the width of the progress bar and the numeric value of the progress on the view.
 *  I am intentionally not using HTML5 progress tag, as its implementation is completely up to the browser vendor.
 *  This div based method does is browser independent. 
 */

function updateProgressMeter(progress) {
	    
    $('#progressbar').width(progress + '%');
    $('.progress-value').html(progress + '%');					
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
		
		var source = new EventSource("/VirtualizationManager/api/virtualEntities/First");
			   
		source.addEventListener('provisionstart', function(event) {
		   $('.progress-waiting').css("display", "none");
		   $('.progress-wrapper').css("display", "block");
		   $('.progress-value').html(event.data);	
		   console.log("In provisionstart listener: " + event.data);
		}, false);	 
			   
		source.addEventListener('provisionend', function(event) {
		   $('.progress-wrapper').css("display", "none");
		   // scope.requeryVMs();
		   console.log("In provisionend listener: " + event.data);
		}, false);	 

		source.addEventListener('provisionedfile', function(event) {
		   // scope.requeryVMs();
		   console.log("Provisioned file: " + event.data);
		}, false);	
			   
		source.addEventListener('apperror', function(event) {
		   $('.progress-value').html(event.data);
		   console.log("In apperror listener: " + event.data);
		}, false);	 
			   
		source.addEventListener('progress', function(event) {
		   console.log("In progress listener: " + event.data);
		   updateProgressMeter(event.data);
		}, false);	 			   

		source.onopen = function (event) { 
		   // alert("opened, event id: " + event.id + " event data: " + event.data);   
		   console.log("opened");
		};
			 
		source.onerror = function (event) { 	
		   // alert ("Got an error, ready state: " + source.readyState);
		   console.log("Got an error, ready state: " + source.readyState);
		   source.close();
		};
	}	
	else {
	    alert ("Sorry! No server-sent events support..");
	}	 	 
}