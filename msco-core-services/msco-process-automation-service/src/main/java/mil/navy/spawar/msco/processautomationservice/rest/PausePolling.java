package mil.navy.spawar.msco.processautomationservice.rest;

import mil.navy.spawar.msco.processautomationservice.ProcessAutomationService;

import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.resource.Put;
import org.restlet.resource.ServerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A class to handle service requests for retrieving Exercises
 */
public class PausePolling extends ServerResource{
    /**
     * Respond to service requests for retrieving Exercises
     * 
     * @return result of the request
     */
	private static final Logger logger = LoggerFactory.getLogger(PausePolling.class);
	
	@Put("json")
	public String handlePost(String value) {
		JSONObject requestBody = new JSONObject(value);
		
		try
		{
			if (requestBody.has("pause"))
			{
				boolean pause = requestBody.getBoolean("pause");
				ProcessAutomationService.getInstance().pausePolling(pause);
			}
		}
		catch(JSONException jse)
		{
			logger.error("Error creating JSON response object", jse);
		}
		
		JSONObject result = new JSONObject();
		result.put("paused", !ProcessAutomationService.getInstance().isPolling());
		
		return result.toString();
    }
}


