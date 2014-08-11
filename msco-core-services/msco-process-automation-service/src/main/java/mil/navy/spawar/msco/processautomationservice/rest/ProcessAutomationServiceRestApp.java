package mil.navy.spawar.msco.processautomationservice.rest;

import javax.annotation.PostConstruct;

import mil.navy.spawar.msco.processautomationservice.ProcessAutomationService;

import org.restlet.Application;

/**
 * A class to handle service requests for the Process Automation Service
 */
public class ProcessAutomationServiceRestApp extends Application
{
	/**
	 * Creates router for service requests to the Process Automation Service
	 *
	 * @return The resulting router Restlet object
	 */
	
	@PostConstruct
	public void startPas() {
		ProcessAutomationService.getInstance();
	}
}
