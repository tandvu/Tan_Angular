package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.MissionProductLogEntry;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class MissionProductLogEntryTest {
	private static final String MISSION_PRODUCT_LOG_ENTRY_JSON =  "{\"_id\": \"53aafc575cc106d60c69904a\", " +
												 		"\"processInstanceId\": \"mission1\", " +
												 		"\"instanceTaskId\" : \"missionProduct1\", " +
												 		"\"prevTaskIds\": [\"1\", \"2\"], "  +
												 		"\"missionName\": \"/my/file/path\", " +
												 		"\"taskName\": \"/my/file/path\", " +
												 		"\"productName\": \"myworkproduct1\", " +
												 		"\"productDescription\": \"Model\", " +
												 		"\"path\": \"task1\", " +
												 		"\"fileSizeBytes\": \"input\", " +
												 		"\"user\": \"Simulated\", " +
												 		"\"time\": \"2014-06-25\" " +
												 		"}"; 

	private static final Logger logger = LoggerFactory.getLogger(MissionProductLogEntryTest.class);
	
	@Test
    public void createMissionProductLogEntryFromJsonString() throws IOException
    {	
		MissionProductLogEntry missionProductLogEntry = JsonUtils.createFromJsonString(MISSION_PRODUCT_LOG_ENTRY_JSON, 
				MissionProductLogEntry.class);
		
		assertNotNull(missionProductLogEntry);
		
		logger.debug("MissionProductLogEntryTest JSON String: " + MISSION_PRODUCT_LOG_ENTRY_JSON);
		logger.debug("MissionProductLogEntry Object As JSON: " + missionProductLogEntry.toJsonString());
		
		assertTrue(missionProductLogEntry.get_id().equals("53aafc575cc106d60c69904a"));
		assertTrue(missionProductLogEntry.getPrevTaskIds().size() == 2);
    }
	
	@Test
    public void writeMissionProductLogEntryAsJsonString() throws IOException
    {		
		MissionProductLogEntry missionProductLogEntry = JsonUtils.createFromJsonString(MISSION_PRODUCT_LOG_ENTRY_JSON, 
				MissionProductLogEntry.class);
		
		assertNotNull(missionProductLogEntry);
		
		logger.debug("MissionProductLogEntryTest JSON String (No WS): " + MISSION_PRODUCT_LOG_ENTRY_JSON.replaceAll("\\s+",""));
		logger.debug("MissionProductLogEntry Object As JSON: " + missionProductLogEntry.toJsonString());
		
		assertTrue(MISSION_PRODUCT_LOG_ENTRY_JSON.replaceAll("\\s+","").equals(missionProductLogEntry.toJsonString()));
    }
}