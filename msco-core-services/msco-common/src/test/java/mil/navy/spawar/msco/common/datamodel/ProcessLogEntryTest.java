package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.ProcessLogEntry;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class ProcessLogEntryTest {
	private static final String PROCESS_LOG_ENTRY_JSON =  "{ \"_id\": \"53aafc575cc106d60c69904a\", " +
												 			"\"processInstanceId\": \"processA\", " +
												 			"\"instanceTaskId\" : \"taskId1\", " +
												 			"\"missionName\": \"mission1\", " +
												 			"\"taskName\": \"task1\", " +
												 			"\"message\": \"EverythingInItsRightPlace\", " +
												 			"\"user\": \"PAS\", " +
												 			"\"time\": \"2004-12-12\" " +
												 			"}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(ProcessLogEntryTest.class);
	
	@Test
    public void createProcessLogEntryFromJsonString() throws IOException
    {	
		ProcessLogEntry processLogEntry = JsonUtils.createFromJsonString(PROCESS_LOG_ENTRY_JSON, 
				ProcessLogEntry.class);
		
		assertNotNull(processLogEntry);
		
		logger.debug("ProcessLogEntryTest JSON String: " + PROCESS_LOG_ENTRY_JSON);
		logger.debug("ProcessLogEntry Object As JSON: " + processLogEntry.toJsonString());
		
		assertTrue(processLogEntry.get_id().equals("53aafc575cc106d60c69904a"));
    }
	
	@Test
    public void writeProcessLogEntryAsJsonString() throws IOException
    {		
		ProcessLogEntry processLogEntry = JsonUtils.createFromJsonString(PROCESS_LOG_ENTRY_JSON, 
				ProcessLogEntry.class);
		
		assertNotNull(processLogEntry);
		
		logger.debug("ProcessLogEntryTest JSON String (No WS): " + PROCESS_LOG_ENTRY_JSON.replaceAll("\\s+",""));
		logger.debug("ProcessLogEntry Object As JSON: " + processLogEntry.toJsonString());
		
		assertTrue(PROCESS_LOG_ENTRY_JSON.replaceAll("\\s+","").equals(processLogEntry.toJsonString()));
    }
}