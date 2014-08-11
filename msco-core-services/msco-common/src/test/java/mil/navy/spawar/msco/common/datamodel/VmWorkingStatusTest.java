package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;

import mil.navy.spawar.msco.common.JsonUtils;
import mil.navy.spawar.msco.common.datamodel.VmWorkingStatus;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.Assert.*;

public class VmWorkingStatusTest {
	private static final String VM_STATUS_JSON = "{      \"status\": \"OK\", " +
												 		"\"currentStage\": \"Complete\", " +
												 		"\"endStage\": \"Complete\", " +
												 		"\"percentComplete\": \"100\", " +
												 		"\"statusDescription\" : \"EverthingInItsRightPlace\" }";
	
	private static final Logger logger = LoggerFactory.getLogger(VmWorkingStatusTest.class);
	
	@Test
    public void createVmWorkingStatusFromJsonString() throws IOException
    {		
		VmWorkingStatus vmStatus = JsonUtils.createFromJsonString(VM_STATUS_JSON, VmWorkingStatus.class);
		
		assertNotNull(vmStatus);
		
		logger.debug("VmWorkingStatus JSON String: " + VM_STATUS_JSON);
		logger.debug("VmWorkingStatus As JSON: " + vmStatus.toJsonString());
		
		assertTrue(vmStatus.getPercentComplete().equals("100"));
    }
}

