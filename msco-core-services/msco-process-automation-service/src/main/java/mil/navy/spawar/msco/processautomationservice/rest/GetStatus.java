package mil.navy.spawar.msco.processautomationservice.rest;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import mil.navy.spawar.msco.common.datamodel.Exercise;
import mil.navy.spawar.msco.common.datamodel.Mission;
import mil.navy.spawar.msco.common.datamodel.MissionProduct;
import mil.navy.spawar.msco.common.datamodel.UnstartedTask;
import mil.navy.spawar.msco.processautomationservice.ProcessAutomationService;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A class to handle service requests for retrieving PAS status
 */
public class GetStatus extends ServerResource{
    /**
     * Respond to service requests for retrieving PAS status
     * 
     * @return result of the request
     */
	private static final Logger logger = LoggerFactory.getLogger(GetStatus.class);
	
	@Get
	public String handleGet()
    {
        JSONObject statusJson = new JSONObject();
        try {
			statusJson.put("enabled", ProcessAutomationService.getInstance().getConfiguration().isEnabled());
			statusJson.put("polling", ProcessAutomationService.getInstance().isPolling());
			
			//Poll Times
			SimpleDateFormat pollTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss zzz");
			
			Date exercisesNextRefreshTime = ProcessAutomationService.getInstance().getNextExercisePollTime();
			Date missionsNextRefreshTime = ProcessAutomationService.getInstance().getNextMissionPollTime();
			Date tasksNextRefreshTime = ProcessAutomationService.getInstance().getNextTaskPollTime();

			statusJson.put("exercisesNextRefreshTime", pollTimeFormat.format(exercisesNextRefreshTime));
			statusJson.put("missionsNextRefreshTime", pollTimeFormat.format(missionsNextRefreshTime));
			statusJson.put("tasksNextRefreshTime", pollTimeFormat.format(tasksNextRefreshTime));
			
			JSONArray exercisesJsonArray = new JSONArray();
			statusJson.put("exercises", exercisesJsonArray);
			
			List<Exercise> exercises = ProcessAutomationService.getInstance().getExerciseList();
			JSONObject currentExerciseJson = null;
			
			if(exercises != null)
			{
				for(Exercise currentExercise : exercises)
				{
					//Get the Exercise Info
					currentExerciseJson = new JSONObject(currentExercise.toJsonString());
					exercisesJsonArray.put(currentExerciseJson);
					
					//Get the Mission Info
					List<Mission> missions = ProcessAutomationService.getInstance().getMissionsMap().get(currentExercise.getName());
					JSONArray currentMissionJsonArray = new JSONArray();
					
					if(missions != null)
					{
						for(Mission mission : missions)
						{
							JSONObject currentMissionJson = new JSONObject(mission.toJsonString());
							
							//Get the Unstarted Tasks Info
							List<UnstartedTask> unstartedTasks = ProcessAutomationService.getInstance().getUnstartedTasksMap().get(
									mission.get_id());
							
							JSONArray unstartedTaskJsonArray = new JSONArray();
							
							if(unstartedTasks != null)
							{
								for(UnstartedTask unstartedTask : unstartedTasks)
								{
									unstartedTaskJsonArray.put(new JSONObject(unstartedTask.toJsonString()));
								}
							}
							
							currentMissionJson.put("unstartedTasks", unstartedTaskJsonArray);
							currentMissionJsonArray.put(currentMissionJson);
						}
					}
					
					currentExerciseJson.put("missions", currentMissionJsonArray);
					
					//Get the Mission Product Info
					List<MissionProduct> missionProducts = ProcessAutomationService.getInstance().getMissionProductsMap().get(
							currentExercise.getName());
					
					JSONArray currentMissionProductJsonArray = new JSONArray();
					for(MissionProduct missionProduct : missionProducts)
					{
						currentMissionProductJsonArray.put(new JSONObject(missionProduct.toJsonString()));
					}
					
					currentExerciseJson.put("missionProducts", currentMissionProductJsonArray);
				}
			}	
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			logger.error("Error creating JSON response object", e);
		}
       
        return statusJson.toString();
    }
}
