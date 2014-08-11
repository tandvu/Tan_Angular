$(document).ready(function() {

	$("#loginSubmit").click(function(e){
		$("#messageLoginError").hide();

  		$.ajax("login", {
	      type: "POST",
	      data: $("#loginForm").serialize(),
	      success: function(data, textStatus, jqXHR) {
	      	window.location.replace("/dashboard");
	      },
	      error: function(jqXHR, textStatus, errorThrown ) {
	      	$("#messageLoginError").show();
	      }
		});
  	});

	$("#loginForm input").keypress(function(e) {
		if(e.which == 13) {
			$("#loginSubmit").click();
		}
	});
})
