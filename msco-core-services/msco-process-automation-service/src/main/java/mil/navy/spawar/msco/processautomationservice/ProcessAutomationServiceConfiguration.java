package mil.navy.spawar.msco.processautomationservice;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProcessAutomationServiceConfiguration {
	private static final Logger logger = LoggerFactory.getLogger(ProcessAutomationServiceConfiguration.class);
	
	private boolean enabled;
	private long exerciseRefreshMs;
	private long missionRefreshMs;
	private long taskRefreshMs;

	// ECS
	private String ecsServiceProto;
	private String ecsServiceAddr;
	private String ecsServiceUri;
	private String ecsServicePort;
	private String ecsServiceUser;
	private String ecsServicePass;
	
	private String ecsServiceExerciseEndpoint; 
	private String ecsServiceProcessLoggingEndpoint;
	private String ecsServiceErrorLoggingEndpoint; 
	
	// FVE
	private String fveServiceUri;
	private String fveServiceMissionEndpoint; 
	private String fveServiceMissionProductsEndpoint; 
	private String fveServiceProcessInstanceEndpoint; 
	private String fveServiceInstanceTaskEndpoint; 
	private String fveServiceInstanceVariableEndpoint; 
	
	private String fveServiceUnstartedTasksEndpoint; 
	private String fveServiceStopMissionEndpoint; 
	private String fveServiceStartTaskEndpoint; 
	private String fveServiceCompleteTaskEndpoint; 
	private String fveServiceRoleAssignmentsEndpoint; 

	// FMS
	private String fmsServiceProto;
	private String fmsServiceAddr;
	private String fmsServiceUri;
	private String fmsServicePort;
	private String fmsServiceCopyEndpoint;
	
	public ProcessAutomationServiceConfiguration(String propertiesFilePath)
	{
		Properties prop = new Properties();
		InputStream input = null;
		
		try 
		{
			URL propertiesUrl =	getClass().getClassLoader().getResource(propertiesFilePath);
			
			input = propertiesUrl.openStream();
			prop.load(input);
			
			enabled = Boolean.parseBoolean(prop.getProperty("pas.enabled", "false"));		//If we can't read the file, default enabled to false
			exerciseRefreshMs = Long.parseLong(prop.getProperty("pas.exerciseRefreshMs"));
			missionRefreshMs = Long.parseLong(prop.getProperty("pas.missionRefreshMs"));
			taskRefreshMs = Long.parseLong(prop.getProperty("pas.taskRefreshMs"));

			ecsServiceProto = prop.getProperty("pas.ecsService.proto");
			ecsServiceAddr = prop.getProperty("pas.ecsService.addr");
			ecsServiceUri = prop.getProperty("pas.ecsService.uri");
			ecsServicePort = prop.getProperty("pas.ecsService.port");
			ecsServiceUser = prop.getProperty("pas.ecsService.user");
			ecsServicePass = prop.getProperty("pas.ecsService.pass");
			
			ecsServiceExerciseEndpoint = prop.getProperty("pas.ecsService.exerciseEndpoint");
			ecsServiceProcessLoggingEndpoint = prop.getProperty("pas.ecsService.processLoggingEndpoint");
			ecsServiceErrorLoggingEndpoint = prop.getProperty("pas.ecsService.errorLoggingEndpoint");
			
			fveServiceUri = prop.getProperty("pas.fveService.uri");
			
			fveServiceMissionEndpoint = prop.getProperty("pas.fveService.missionEndpoint");
			fveServiceMissionProductsEndpoint = prop.getProperty("pas.fveService.missionProductsEndpoint");
			fveServiceProcessInstanceEndpoint = prop.getProperty("pas.fveService.processInstanceEndpoint");
			fveServiceInstanceTaskEndpoint = prop.getProperty("pas.fveService.instanceTaskEndpoint");
			fveServiceInstanceVariableEndpoint = prop.getProperty("pas.fveService.instanceVariableEndpoint");
			
			fveServiceUnstartedTasksEndpoint = prop.getProperty("pas.fveService.fveServiceUnstartedTasksEndpoint");
			fveServiceStopMissionEndpoint = prop.getProperty("pas.fveService.fveServiceStopMissionEndpoint");
			fveServiceStartTaskEndpoint = prop.getProperty("pas.fveService.fveServiceStartTaskEndpoint");
			fveServiceCompleteTaskEndpoint = prop.getProperty("pas.fveService.fveServiceCompleteTaskEndpoint");
			fveServiceRoleAssignmentsEndpoint = prop.getProperty("pas.fveService.fveServiceRoleAssignmentsEndpoint");
			
			fmsServiceProto = prop.getProperty("pas.fmsService.proto");
			fmsServiceAddr = prop.getProperty("pas.fmsService.addr");
			fmsServiceUri = prop.getProperty("pas.fmsService.uri");
			fmsServicePort = prop.getProperty("pas.fmsService.port");
			fmsServiceCopyEndpoint = prop.getProperty("pas.fmsService.copyEndpoint");

		} catch (IOException ex) {
			logger.error("Error reading ProcessAutomationServiceConfiguration file", ex);
			enabled = false;
		} catch (NumberFormatException nfe) {
			logger.error("Error parsing number in ProcessAutomationServiceConfiguration file", nfe);
			enabled = false;
		}
		finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
					logger.error("IO Error closing ProcessAutomationServiceConfiguration file", e);
				}
			}
		}
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public long getExerciseRefreshMs() {
		return exerciseRefreshMs;
	}

	public void setExerciseRefreshMs(long exerciseRefreshMs) {
		this.exerciseRefreshMs = exerciseRefreshMs;
	}

	public long getMissionRefreshMs() {
		return missionRefreshMs;
	}

	public void setMissionRefreshMs(long missionRefreshMs) {
		this.missionRefreshMs = missionRefreshMs;
	}

	public long getTaskRefreshMs() {
		return taskRefreshMs;
	}

	public void setTaskRefreshMs(long taskRefreshMs) {
		this.taskRefreshMs = taskRefreshMs;
	}

	public String getEcsServiceProto() {
		return ecsServiceProto;
	}

	public void setEcsServiceProto(String ecsServiceProto) {
		this.ecsServiceProto = ecsServiceProto;
	}

	public String getEcsServiceAddr() {
		return ecsServiceAddr;
	}

	public void setEcsServiceAddr(String ecsServiceAddr) {
		this.ecsServiceAddr = ecsServiceAddr;
	}

	public String getEcsServiceUri() {
		return ecsServiceUri;
	}

	public void setEcsServiceUri(String ecsServiceUri) {
		this.ecsServiceUri = ecsServiceUri;
	}

	public String getEcsServicePort() {
		return ecsServicePort;
	}

	public void setEcsServicePort(String ecsServicePort) {
		this.ecsServicePort = ecsServicePort;
	}

	public String getEcsServiceUser() {
		return ecsServiceUser;
	}

	public void setEcsServiceUser(String ecsServiceUser) {
		this.ecsServiceUser = ecsServiceUser;
	}

	public String getEcsServicePass() {
		return ecsServicePass;
	}

	public void setEcsServicePass(String ecsServicePass) {
		this.ecsServicePass = ecsServicePass;
	}

	public String getEcsServiceExerciseEndpoint() {
		return ecsServiceExerciseEndpoint;
	}

	public void setEcsServiceExerciseEndpoint(String ecsServiceExerciseEndpoint) {
		this.ecsServiceExerciseEndpoint = ecsServiceExerciseEndpoint;
	}

	public String getFveServiceUri() {
		return fveServiceUri;
	}

	public void setFveServiceUri(String fveServiceUri) {
		this.fveServiceUri = fveServiceUri;
	}

	public String getFveServiceMissionEndpoint() {
		return fveServiceMissionEndpoint;
	}

	public void setFveServiceMissionEndpoint(String fveServiceMissionEndpoint) {
		this.fveServiceMissionEndpoint = fveServiceMissionEndpoint;
	}

	public String getFveServiceMissionProductsEndpoint() {
		return fveServiceMissionProductsEndpoint;
	}

	public void setFveServiceMissionProductsEndpoint(
			String fveServiceMissionProductsEndpoint) {
		this.fveServiceMissionProductsEndpoint = fveServiceMissionProductsEndpoint;
	}

	public String getFveServiceProcessInstanceEndpoint() {
		return fveServiceProcessInstanceEndpoint;
	}

	public void setFveServiceProcessInstanceEndpoint(
			String fveServiceProcessInstanceEndpoint) {
		this.fveServiceProcessInstanceEndpoint = fveServiceProcessInstanceEndpoint;
	}

	public String getFveServiceInstanceTaskEndpoint() {
		return fveServiceInstanceTaskEndpoint;
	}

	public void setFveServiceInstanceTaskEndpoint(
			String fveServiceInstanceTaskEndpoint) {
		this.fveServiceInstanceTaskEndpoint = fveServiceInstanceTaskEndpoint;
	}

	public String getFveServiceInstanceVariableEndpoint() {
		return fveServiceInstanceVariableEndpoint;
	}

	public void setFveServiceInstanceVariableEndpoint(
			String fveServiceInstanceVariableEndpoint) {
		this.fveServiceInstanceVariableEndpoint = fveServiceInstanceVariableEndpoint;
	}

	public String getEcsServiceProcessLoggingEndpoint() {
		return ecsServiceProcessLoggingEndpoint;
	}

	public void setEcsServiceProcessLoggingEndpoint(
			String ecsServiceProcessLoggingEndpoint) {
		this.ecsServiceProcessLoggingEndpoint = ecsServiceProcessLoggingEndpoint;
	}

	public String getEcsServiceErrorLoggingEndpoint() {
		return ecsServiceErrorLoggingEndpoint;
	}

	public void setEcsServiceErrorLoggingEndpoint(
			String ecsServiceErrorLoggingEndpoint) {
		this.ecsServiceErrorLoggingEndpoint = ecsServiceErrorLoggingEndpoint;
	}

	public String getFveServiceUnstartedTasksEndpoint() {
		return fveServiceUnstartedTasksEndpoint;
	}

	public void setFveServiceUnstartedTasksEndpoint(
			String fveServiceUnstartedTasksEndpoint) {
		this.fveServiceUnstartedTasksEndpoint = fveServiceUnstartedTasksEndpoint;
	}

	public String getFveServiceStopMissionEndpoint() {
		return fveServiceStopMissionEndpoint;
	}

	public void setFveServiceStopMissionEndpoint(
			String fveServiceStopMissionEndpoint) {
		this.fveServiceStopMissionEndpoint = fveServiceStopMissionEndpoint;
	}

	public String getFveServiceStartTaskEndpoint() {
		return fveServiceStartTaskEndpoint;
	}

	public void setFveServiceStartTaskEndpoint(String fveServiceStartTaskEndpoint) {
		this.fveServiceStartTaskEndpoint = fveServiceStartTaskEndpoint;
	}

	public String getFveServiceCompleteTaskEndpoint() {
		return fveServiceCompleteTaskEndpoint;
	}

	public void setFveServiceCompleteTaskEndpoint(
			String fveServiceCompleteTaskEndpoint) {
		this.fveServiceCompleteTaskEndpoint = fveServiceCompleteTaskEndpoint;
	}

	public String getFmsServiceProto()
	{
		return fmsServiceProto;
	}

	public void setFmsServiceProto(String fmsServiceProto)
	{
		this.fmsServiceProto = fmsServiceProto;
	}

	public String getFmsServiceAddr()
	{
		return fmsServiceAddr;
	}

	public void setFmsServiceAddr(String fmsServiceAddr)
	{
		this.fmsServiceAddr = fmsServiceAddr;
	}

	public String getFmsServiceUri()
	{
		return fmsServiceUri;
	}

	public void setFmsServiceUri(String fmsServiceUri)
	{
		this.fmsServiceUri = fmsServiceUri;
	}

	public String getFmsServicePort()
	{
		return fmsServicePort;
	}

	public void setFmsServicePort(String fmsServicePort)
	{
		this.fmsServicePort = fmsServicePort;
	}

	public String getFmsServiceCopyEndpoint()
	{
		return fmsServiceCopyEndpoint;
	}

	public void setFmsServiceCopyEndpoint(String fmsServiceCopyEndpoint)
	{
		this.fmsServiceCopyEndpoint = fmsServiceCopyEndpoint;
	}

	public String getFveServiceRoleAssignmentsEndpoint()
	{
		return fveServiceRoleAssignmentsEndpoint;
	}

	public void setFveServiceRoleAssignmentsEndpoint(String fveServiceRoleAssignmentsEndpoint)
	{
		this.fveServiceRoleAssignmentsEndpoint = fveServiceRoleAssignmentsEndpoint;
	}

	@Override
	public String toString()
	{
		return "ProcessAutomationServiceConfiguration [enabled=" + enabled + ", exerciseRefreshMs=" + exerciseRefreshMs + ", missionRefreshMs="
				+ missionRefreshMs + ", taskRefreshMs=" + taskRefreshMs + ", ecsServiceProto=" + ecsServiceProto + ", ecsServiceAddr=" + ecsServiceAddr
				+ ", ecsServiceUri=" + ecsServiceUri + ", ecsServicePort=" + ecsServicePort + ", ecsServiceUser=" + ecsServiceUser + ", ecsServicePass="
				+ ecsServicePass + ", ecsServiceExerciseEndpoint=" + ecsServiceExerciseEndpoint + ", ecsServiceProcessLoggingEndpoint="
				+ ecsServiceProcessLoggingEndpoint + ", ecsServiceErrorLoggingEndpoint=" + ecsServiceErrorLoggingEndpoint + ", fveServiceUri=" + fveServiceUri
				+ ", fveServiceMissionEndpoint=" + fveServiceMissionEndpoint + ", fveServiceMissionProductsEndpoint=" + fveServiceMissionProductsEndpoint
				+ ", fveServiceProcessInstanceEndpoint=" + fveServiceProcessInstanceEndpoint + ", fveServiceInstanceTaskEndpoint="
				+ fveServiceInstanceTaskEndpoint + ", fveServiceInstanceVariableEndpoint=" + fveServiceInstanceVariableEndpoint
				+ ", fveServiceUnstartedTasksEndpoint=" + fveServiceUnstartedTasksEndpoint + ", fveServiceStopMissionEndpoint=" + fveServiceStopMissionEndpoint
				+ ", fveServiceStartTaskEndpoint=" + fveServiceStartTaskEndpoint + ", fveServiceCompleteTaskEndpoint=" + fveServiceCompleteTaskEndpoint
				+ ", fveServiceRoleAssignmentsEndpoint=" + fveServiceRoleAssignmentsEndpoint + ", fmsServiceProto=" + fmsServiceProto + ", fmsServiceAddr="
				+ fmsServiceAddr + ", fmsServiceUri=" + fmsServiceUri + ", fmsServicePort=" + fmsServicePort + ", fmsServiceCopyEndpoint="
				+ fmsServiceCopyEndpoint + "]";
	}
}
