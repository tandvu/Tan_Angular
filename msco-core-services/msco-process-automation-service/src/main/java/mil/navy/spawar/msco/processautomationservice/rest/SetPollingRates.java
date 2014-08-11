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
public class SetPollingRates extends ServerResource{
	private static final Logger logger = LoggerFactory.getLogger(SetPollingRates.class);
	
	/**
     * Respond to service requests for retrieving Exercises
     * 
     * @return result of the request
     */
	@Put("json")
	public String handlePut(String value)
	{
		JSONObject requestBody = new JSONObject(value);
		JSONObject response = new JSONObject();
		
		// Exercise Rate
		try
		{
			if (requestBody.has("exerciseRateMs"))
			{
				int exerciseRateMs = requestBody.getInt("exerciseRateMs");
				if(exerciseRateMs > 0)
				{
					ProcessAutomationService.getInstance().getConfiguration().setExerciseRefreshMs(exerciseRateMs);
					response.put("setExerciseRate", "true");
				}
				else
				{
					response.put("setExerciseRate", "false");
				}
			}
		}
		catch(JSONException jse)
		{
			logger.error("Error creating JSON response object", jse);
			response.put("setExerciseRate", "false");
		}
		finally
		{
			response.put("exerciseRateMs", 
					ProcessAutomationService.getInstance().getConfiguration().getExerciseRefreshMs());
		}
		
		// Mission Rate
		try
		{
			if (requestBody.has("missionRateMs"))
			{
				int missionRateMs = requestBody.getInt("missionRateMs");
				if(missionRateMs > 0)
				{
					ProcessAutomationService.getInstance().getConfiguration().setMissionRefreshMs(missionRateMs);
					response.put("setMissionRate", "true");
				}
				else
				{
					response.put("setMissionRate", "false");
				}
			}
		}
		catch(JSONException jse)
		{
			logger.error("Error creating JSON response object", jse);
			response.put("setMissionRate", "false");
		}
		finally
		{
			response.put("missionRateMs", 
					ProcessAutomationService.getInstance().getConfiguration().getMissionRefreshMs());
		}
		
		// Task Rate
		try
		{
			if (requestBody.has("taskRateMs"))
			{
				int taskRateMs = requestBody.getInt("taskRateMs");
				if(taskRateMs > 0)
				{
					ProcessAutomationService.getInstance().getConfiguration().setTaskRefreshMs(taskRateMs);
					response.put("setTaskRate", "true");
				}
				else
				{
					response.put("setTaskRate", "false");
				}
			}
		}
		catch(JSONException jse)
		{
			logger.error("Error creating JSON response object", jse);
			response.put("setTaskRate", "false");
		}
		finally
		{
			response.put("taskRateMs", 
					ProcessAutomationService.getInstance().getConfiguration().getTaskRefreshMs());
		}
		
		return response.toString();
    }
}

