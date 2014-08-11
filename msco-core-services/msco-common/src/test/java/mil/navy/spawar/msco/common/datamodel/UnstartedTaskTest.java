package mil.navy.spawar.msco.common.datamodel;

import java.io.IOException;




import mil.navy.spawar.msco.common.datamodel.UnstartedTask.TaskRole;
import mil.navy.spawar.msco.common.datamodel.UnstartedTask.TaskState;

import org.junit.Test;

import static junit.framework.Assert.*;

public class UnstartedTaskTest {
	
	@Test
    public void testTaskEnumerations() throws IOException
    {		
		//TASK STATE ENUM
		String created = "Created";
		String ready = "Ready";
		String reserved = "Reserved";
		String inProgress = "InProgress";
		String suspended = "Suspended";
		String completed = "Completed";
		String failed = "Failed";
		String error = "Error";
		String exited = "Exited";
		String obselete = "Obsolete";
		
		assertEquals(created, TaskState.Created.toString());
		assertEquals(ready, TaskState.Ready.toString());
		assertEquals(reserved, TaskState.Reserved.toString());
		assertEquals(inProgress, TaskState.InProgress.toString());
		assertEquals(suspended, TaskState.Suspended.toString());
		assertEquals(completed, TaskState.Completed.toString());
		assertEquals(failed, TaskState.Failed.toString());
		assertEquals(error, TaskState.Error.toString());
		assertEquals(exited, TaskState.Exited.toString());
		assertEquals(obselete, TaskState.Obsolete.toString());
		
		// TASK ROLE
		String trainingAudience = "Training Audience";
		String trainer = "Trainer";
		String simulatedRole = "Simulated Role";
		
		assertEquals(trainingAudience, TaskRole.Training_Audience.toString());
		assertEquals(trainer, TaskRole.Trainer.toString());
		assertEquals(simulatedRole, TaskRole.Simulated_Role.toString());
    }
}
