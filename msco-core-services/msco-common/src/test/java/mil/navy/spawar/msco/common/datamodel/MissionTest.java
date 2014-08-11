package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.Mission;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class MissionTest {

	private static final String MISSION_JSON = "{\"_id\": \"myMission\", " +
												 "\"name\": \"mission1\", " +
												 "\"processName\" : \"process1\", " +
												 "\"deploymentId\" : \"deployment1\", " +
												 "\"processId\" : \"processId\"}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(MissionTest.class);
	
	@Test
    public void createMissionFromJsonString() throws IOException
    {		
		Mission mission = JsonUtils.createFromJsonString(MISSION_JSON, Mission.class);
		
		assertNotNull(mission);
		
		logger.debug("MissionTest JSON String: " + MISSION_JSON);
		logger.debug("Mission Object As JSON: " + mission.toJsonString());
		
		assertTrue(mission.get_id().equals("myMission"));
    }
}
