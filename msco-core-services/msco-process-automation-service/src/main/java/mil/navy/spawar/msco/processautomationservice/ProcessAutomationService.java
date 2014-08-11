package mil.navy.spawar.msco.processautomationservice;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import mil.navy.spawar.msco.common.HttpUtils;
import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.ErrorLogEntry;
import mil.navy.spawar.msco.common.datamodel.Exercise;
import mil.navy.spawar.msco.common.datamodel.InstanceTask;
import mil.navy.spawar.msco.common.datamodel.InstanceVariable;
import mil.navy.spawar.msco.common.datamodel.Mission;
import mil.navy.spawar.msco.common.datamodel.MissionProduct;
import mil.navy.spawar.msco.common.datamodel.ProcessInstance;
import mil.navy.spawar.msco.common.datamodel.ProcessLogEntry;
import mil.navy.spawar.msco.common.datamodel.RoleAssignment;
import mil.navy.spawar.msco.common.datamodel.UnstartedTask;
import mil.navy.spawar.msco.common.datamodel.UnstartedTask.TaskRole;
import mil.navy.spawar.msco.common.datamodel.UnstartedTask.TaskState;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProcessAutomationService {
	
	/**
	 * Gives access to the one and only ProcessAutomationService instance.
	 * 
	 * @return the one and only ProcessAutomationService instance
	 */
    private static class LazyHolder {
        private static final ProcessAutomationService INSTANCE = new ProcessAutomationService();
    }

    public static ProcessAutomationService getInstance() {
        return LazyHolder.INSTANCE;
    }
    
	private static final String PROPERTIES_FILE_PATH = "pas-config.properties";
	private static final String PAS_USER = "PAS";
	private static final String COPY_BASE_PATH = "Execution";
	private static final int JBPM_REQUEST_DELAY_MS = 1000;
	private static final Logger logger = LoggerFactory.getLogger(ProcessAutomationService.class);

	private ProcessAutomationServiceConfiguration config;
	private List<Exercise> exerciseList;
	
	// Keyed by Exercise Name
	private Map<String, List<Mission>> missionsMap;
	private Map<String, List<MissionProduct>> missionProductsMap;
	
	// Keyed by Mission Id
	private Map<String, List<UnstartedTask>> unstartedTasksMap;

	private ProcessAutomationServicePoller poller;
	private Thread pollerThread;
	
	private ProcessAutomationService() {
		config = new ProcessAutomationServiceConfiguration(PROPERTIES_FILE_PATH);

		exerciseList = new ArrayList<Exercise>();

		missionsMap = new HashMap<String, List<Mission>>();
		missionProductsMap = new HashMap<String, List<MissionProduct>>();
		unstartedTasksMap = new HashMap<String, List<UnstartedTask>>();

		// Start the Polling Thread
		poller = new ProcessAutomationServicePoller();
		pollerThread = new Thread(poller);
		pollerThread.start();
	}

	public synchronized void pausePolling(boolean pause) {
		if (poller != null) {
			poller.pausePolling(pause);
		}
	}

	public boolean isPolling() {
		boolean result = false;

		if (poller != null) {
			result = !poller.isPaused();
		}

		return result;
	}

	public Date getNextExercisePollTime() {
		Date result = null;

		if (poller != null) {
			result = poller.getExercisesNextRefreshTime();
		}

		return result;
	}

	public Date getNextMissionPollTime() {
		Date result = null;

		if (poller != null) {
			result = poller.getMissionsNextRefreshTime();
		}

		return result;
	}

	public Date getNextTaskPollTime() {
		Date result = null;

		if (poller != null) {
			result = poller.getMissionsNextRefreshTime();
		}

		return result;
	}

	public ProcessAutomationServiceConfiguration getConfiguration() {
		return config;
	}
	
	//////////////////////////////////// GET METHODS ///////////////////////////////////////////////////////
	public List<Exercise> getExercises()
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceExerciseEndpoint());
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, Exercise.class);
	}
	
	public List<Mission> getMissions(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceMissionEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, Mission.class);
	}
	
	public List<MissionProduct> getMissionProducts(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceMissionProductsEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, MissionProduct.class);
	}
	
	public List<ProcessInstance> getProcessInstances(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceProcessInstanceEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, ProcessInstance.class);
	}
	
	public List<InstanceTask> getProcessInstanceTasks(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceInstanceTaskEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, InstanceTask.class);
	}
	
	public List<UnstartedTask> getUnstartedTasks(String exerciseName, String missionId)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceUnstartedTasksEndpoint());
		pathList.add(exerciseName);
		pathList.add(missionId);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		
		// NOTE: Wait so we don't hammer JBPM. Will be fixed in ECS eventually...
		try
		{
			synchronized(this)
			{
				wait(JBPM_REQUEST_DELAY_MS);
			}
		}
		catch(Exception e)
		{
			logger.error("Unexpectedly awoken", e);
		}
		
		return JsonUtils.createListFromJsonString(response, UnstartedTask.class);
	}

	public List<InstanceVariable> getProcessInstanceVariables(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceInstanceVariableEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, InstanceVariable.class);
	}
	
	public List<ProcessLogEntry> getProcessLogEntries(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceProcessLoggingEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, ProcessLogEntry.class);
	}
	
	public List<ErrorLogEntry> getErrorLogEntries(String exerciseName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceErrorLoggingEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, ErrorLogEntry.class);
	}
	
	public List<RoleAssignment> getRoleAssignments(String exerciseName, String roleName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceRoleAssignmentsEndpoint());
		
		//Query Based On roleName (UnstartedTask.role)
		String queryString = "?role="; 
		
		try
		{
			queryString += URLEncoder.encode(roleName, "utf-8");
		} catch (UnsupportedEncodingException e)
		{
			// TODO Auto-generated catch block
			logger.error("Couldn't URLEncode Query String", e);
		}
		
		pathList.add(exerciseName + queryString);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		String response = HttpUtils.doHttpGet(baseUrl);
		return JsonUtils.createListFromJsonString(response, RoleAssignment.class);
	}
	
	//////////////////////////////////// POST METHODS ///////////////////////////////////////////////////////
	public String postProcessLogEntry(ProcessLogEntry entry, String exerciseName)
	{	
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceProcessLoggingEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		return HttpUtils.doHttpPostJson(baseUrl, JsonUtils.toJsonString(entry));
	}
	
	public String postErrorLogEntry(ErrorLogEntry entry, String exerciseName)
	{	
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getEcsServiceErrorLoggingEndpoint());
		pathList.add(exerciseName);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		return HttpUtils.doHttpPostJson(baseUrl, JsonUtils.toJsonString(entry));
	}
	
	public String postStartTask(String exerciseName, String missionId, UnstartedTask task)
	{	
		String instanceTaskId = null;
		
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceStartTaskEndpoint());
		pathList.add(exerciseName);
		pathList.add(missionId);
		pathList.add(task.getPesTaskId());
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		// Get the InstanceTaskId from the Response, returns a single InstanceTask in an array for now
		String response = HttpUtils.doHttpPostJson(baseUrl, "{}");
		
		List<InstanceTask> instanceTasks = JsonUtils.createListFromJsonString(response, InstanceTask.class);
		if(instanceTasks != null && !instanceTasks.isEmpty())
		{
			InstanceTask iTask = instanceTasks.get(0);
			
			if(iTask != null)
			{
				instanceTaskId = iTask.get_id();
			}
		}
		
		return instanceTaskId;
	}
	
	public boolean postCompleteTask(String exerciseName, String missionId, UnstartedTask task, String instanceTaskId)
	{	
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getEcsServiceUri());
		pathList.add(config.getFveServiceUri());
		pathList.add(config.getFveServiceCompleteTaskEndpoint());
		pathList.add(exerciseName);
		pathList.add(instanceTaskId);
		
		String baseUrl = HttpUtils.getEndpoint(config.getEcsServiceProto(), config.getEcsServiceAddr(), 
				config.getEcsServicePort(), pathList);
		
		// TODO: Parse response
		HttpUtils.doHttpPostJson(baseUrl, "{}");
		return true;
	}

	protected boolean putCopyMissionProduct(MissionProduct product, String exerciseName, String missionName)
	{
		List<String> pathList = new ArrayList<String>();
		pathList.add(config.getFmsServiceUri());
		pathList.add(config.getFmsServiceCopyEndpoint());
		
		String baseUrl = HttpUtils.getEndpoint(config.getFmsServiceProto(), config.getFmsServiceAddr(), 
				config.getFmsServicePort(), pathList);
		
		JSONObject body = new JSONObject();
		JSONObject source = new JSONObject();
		JSONObject destination = new JSONObject();
		
		source.put("path", product.getPath());
		source.put("name", product.getFilename());
		
		destination.put("path", "/" + COPY_BASE_PATH + "/" + exerciseName + "/" + missionName);
		destination.put("name", product.getFilename());
		
		body.put("source", source);
		body.put("destination", destination);
		
		// TODO: Parse response
		HttpUtils.doHttpPutJson(baseUrl, body.toString());
		return true;
	}
	
	// Refresh the Exercise List
	public synchronized boolean refreshExercises()
	{
		boolean result = false;
		exerciseList.clear();

		List<Exercise> exercises = getExercises();

		if (exercises != null)
		{
			exerciseList = exercises;
			result = true;
		} 
		else
		{
			exerciseList = Collections.emptyList();
		}

		return result;
	}
	
	// Refresh the Mission-Level Information For Each Exercise
	public synchronized boolean refreshMissions()
	{
		boolean result = true;
		missionsMap.clear();
		missionProductsMap.clear();
		
		for(Exercise exercise : exerciseList)
		{
			// Get Missions
			List<Mission> missionList = getMissions(exercise.getName());
			
			if(missionList != null)
			{
				missionsMap.put(exercise.getName(), missionList);
			}
			else
			{
				missionsMap.put(exercise.getName(), Collections.<Mission> emptyList());
			}
			
			//Get Mission Products
			List<MissionProduct> missionProductList = getMissionProducts(exercise.getName());
			
			if(missionProductList != null)
			{
				missionProductsMap.put(exercise.getName(), missionProductList);
			}
			else
			{
				missionProductsMap.put(exercise.getName(), Collections.<MissionProduct> emptyList());
			}
		}
		
		return result;
	}
	
	// Refresh the UnstartedTask List for each Mission
	public synchronized boolean refreshTasks()
	{
		boolean result = true;
		unstartedTasksMap.clear();
		
		for(Exercise exercise : exerciseList)
		{
			for(Mission mission : missionsMap.get(exercise.getName()))
			{
				//GET THE UNSTARTED TASKS
				List<UnstartedTask> unstartedTasks = getUnstartedTasks(exercise.getName(), mission.get_id());
				
				if(unstartedTasks != null)
				{
					unstartedTasksMap.put(mission.get_id(), unstartedTasks);
				}
				else
				{
					unstartedTasksMap.put(mission.get_id(), Collections.<UnstartedTask> emptyList());
				}
			}
		}
		
		return result;
	}
	
	public synchronized boolean advanceSimulatedTasks()
	{
		boolean result = true;
		
		for(Exercise exercise : exerciseList)
		{
			for(Mission mission : missionsMap.get(exercise.getName()))
			{
				List<UnstartedTask> unstartedTasks = unstartedTasksMap.get(mission.get_id());
				
				if(unstartedTasks != null && !unstartedTasks.isEmpty())
				{
					for(UnstartedTask task : unstartedTasks)
					{
						// If the task is READY OR RESERVED
						if(task.getStatus().equalsIgnoreCase(TaskState.Ready.toString()) ||
					       task.getStatus().equalsIgnoreCase(TaskState.Reserved.toString()) )
						{
							// GET THE ROLE ASSIGNMENTS
							List<RoleAssignment> assignments = getRoleAssignments(exercise.getName(), task.getRole());
							
							// Should only be 1 in the list
							if((assignments != null) && (assignments.size() == 1))
							{
								RoleAssignment assignment = assignments.get(0);
								
								// IF ASSIGNMENT IS SIMULATED
								if(assignment != null && 
										assignment.getAssignment().equalsIgnoreCase(TaskRole.Simulated_Role.toString()))
								{
									logger.debug("PAS detected task to advance: " + task.getName());
									advanceInstanceTask(exercise.getName(), mission, task);
								}
							}
						}
					}
				}
			}
		}
		
		return result;
	}
	
	private boolean advanceInstanceTask(String exerciseName, Mission mission, UnstartedTask task)
	{
		boolean result = false;
		
		// Start the Task
		String instanceTaskId = postStartTask(exerciseName, mission.get_id(), task);
		
		if(instanceTaskId != null)
		{
			// Handle Any Mission Products
			List<MissionProduct> products = missionProductsMap.get(exerciseName);
			
			for(MissionProduct product : products)
			{
				if(product.getTaskName().equals(task.getName()))
				{
					putCopyMissionProduct(product, exerciseName, mission.getName());
				}
			}
			
			// NOTE: Wait so we don't hammer JBPM. Will be fixed in ECS eventually...
			try
			{
				synchronized(this)
				{
					wait(JBPM_REQUEST_DELAY_MS);
				}
			}
			catch(Exception e)
			{
				logger.error("Unexpectedly awoken", e);
			}
			
			postCompleteTask(exerciseName, mission.get_id(), task, instanceTaskId);
			
			// Log that we've moved the Process along to the Next Task
			ProcessLogEntry logEntry = new ProcessLogEntry();
			logEntry.setInstanceTaskId(instanceTaskId);
			logEntry.setTaskName(task.getName());
			
			logEntry.setMissionName(mission.getName());
			logEntry.setProcessInstanceId(mission.getProcessId());
			logEntry.setUser(PAS_USER);
			
			logEntry.setTime((new Date()).toString());
			logEntry.setMessage("PAS advanced task \"" + task.getName() + " for Mission \"" + mission.getName() + "\"");
			
			postProcessLogEntry(logEntry, exerciseName);
			result = true;
		}
		
		return result;
	}

	public List<Exercise> getExerciseList() {
		return Collections.unmodifiableList(exerciseList);
	}

	public Map<String, List<Mission>> getMissionsMap() {
		return Collections.unmodifiableMap(missionsMap);
	}

	public Map<String, List<MissionProduct>> getMissionProductsMap() {
		return Collections.unmodifiableMap(missionProductsMap);
	}

	public Map<String, List<UnstartedTask>> getUnstartedTasksMap() {
		return Collections.unmodifiableMap(unstartedTasksMap);
	}
}