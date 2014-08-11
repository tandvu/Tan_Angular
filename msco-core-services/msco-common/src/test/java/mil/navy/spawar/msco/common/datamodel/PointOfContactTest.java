package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.PointOfContact;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class PointOfContactTest {
	private static final String POC_JSON = "{     \"name\": \"Matt\", " +
												 "\"email\": \"matt@matt.com\", " +
												 "\"phone\" : \"555-233-1212\" }"; 
	
	private static final Logger logger = LoggerFactory.getLogger(PointOfContactTest.class);
	
	@Test
    public void createPointOfContactFromJsonString() throws IOException
    {		
		PointOfContact poc = JsonUtils.createFromJsonString(POC_JSON, PointOfContact.class);
		
		assertNotNull(poc);
		
		logger.debug("POC JSON String: " + POC_JSON);
		logger.debug("POC As JSON: " + poc.toJsonString());
		
		assertTrue(poc.getName().equals("Matt"));
    }
}
