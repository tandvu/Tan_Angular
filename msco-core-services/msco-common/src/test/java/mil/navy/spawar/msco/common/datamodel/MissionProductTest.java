package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.MissionProduct;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class MissionProductTest {
	private static final String MISSION_PRODUCT_JSON =  "{\"_id\": \"53aafc575cc106d60c69904a\", " +
												 		"\"missionId\": \"mission1\", " +
												 		"\"name\" : \"missionProduct1\", " +
												 		"\"description\": \"my work product 1\", " +
												 		"\"role\": \"Model\", " +
												 		"\"taskName\": \"task1\", " +
												 		"\"inputOutput\": \"input\", " +
												 		"\"assignment\": \"Simulated\", " +
												 		"\"path\": \"/my/file/path\"}"; 
	
	private static final Logger logger = LoggerFactory.getLogger(MissionProductTest.class);
	
	@Test
    public void createMissionProductFromJsonString() throws IOException
    {		
		MissionProduct missionProduct =  JsonUtils.createFromJsonString(MISSION_PRODUCT_JSON, 
				MissionProduct.class);
		
		assertNotNull(missionProduct);
		
		logger.debug("MissionProductTest JSON String: " + MISSION_PRODUCT_JSON);
		logger.debug("MissionProduct Object As JSON: " + missionProduct.toJsonString());
		
		assertTrue(missionProduct.get_id().equals("53aafc575cc106d60c69904a"));
    }
}