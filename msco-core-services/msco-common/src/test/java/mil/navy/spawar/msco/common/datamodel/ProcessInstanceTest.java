package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.ProcessInstance;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class ProcessInstanceTest {
	private static final String PROCESS_INSTANCE_JSON = "{\"_id\": \"53ad8f722ec778e13ce6ed69\", " +
												 		 "\"missionId\": \"53ad7a512ec778e13ce6ed58\", " +
												 		 "\"pesInstanceId\": \"jBPM.ProcessInstance.ID\", " +
												 		 "\"name\": \"ProcessInstance Name\", " +
												 		 "\"state\": \"active\", " +
												 		 "\"startTime\": \"7/1/2014\", " +
												 		 "\"stopTime\": \"7/2/2014\"}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(ProcessInstanceTest.class);
	
	@Test
    public void createProcessInstanceFromJsonString() throws IOException
    {		
		ProcessInstance process = JsonUtils.createFromJsonString(PROCESS_INSTANCE_JSON, 
				ProcessInstance.class);
		
		assertNotNull(process);
		
		logger.debug("ProcessInstanceTest JSON String: " + PROCESS_INSTANCE_JSON);
		logger.debug("ProcessInstance Object as JSON: " + process.toJsonString());
		
		assertTrue(process.getPesInstanceId().equals("jBPM.ProcessInstance.ID"));
    }
}