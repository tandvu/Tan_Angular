package mil.navy.spawar.msco.common.datamodel;

import java.util.List;
import mil.navy.spawar.msco.common.JsonUtils;

public class UnstartedTask {
	private String name;
	private String pesTaskId;
	private String role;
	private String owner;
	private String status;
	private List<String> inputNames;
	private List<String> outputNames;
	
	public enum TaskState
	{
		Created, Ready, Reserved, InProgress, Suspended, Completed, Failed, Error, Exited, Obsolete;
	}
	
	public enum TaskRole
	{
		Training_Audience("Training Audience"), Trainer ("Trainer"), Simulated_Role ("Simulated Role");
		
		String roleString;
		private TaskRole(String role) {
			roleString = role;
		}
		
		@Override
		public String toString()
		{
			return roleString;
		}
	}
	
	public UnstartedTask(){}
	
	public UnstartedTask(String jsonString)
	{
		UnstartedTask task = JsonUtils.createFromJsonString(jsonString, UnstartedTask.class);
		
		if(task != null)
		{
			this.name = task.name;
			this.pesTaskId = task.pesTaskId;
			this.role = task.role;
			this.owner = task.owner;
			
			this.status = task.status;
			this.inputNames = task.inputNames;
			this.outputNames = task.outputNames;
		}
	}

	@Override
	public String toString() {
		return "UnstartedTask [name=" + name + ", pesTaskId=" + pesTaskId
				+ ", role=" + role + ", owner=" + owner + ", status=" + status
				+ ", inputNames=" + inputNames + ", outputNames=" + outputNames
				+ "]";
	}
	
	public String toJsonString()
	{
		return JsonUtils.toJsonString(this);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPesTaskId() {
		return pesTaskId;
	}

	public void setPesTaskId(String pesTaskId) {
		this.pesTaskId = pesTaskId;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public List<String> getInputNames() {
		return inputNames;
	}

	public void setInputNames(List<String> inputNames) {
		this.inputNames = inputNames;
	}

	public List<String> getOutputNames() {
		return outputNames;
	}

	public void setOutputNames(List<String> outputNames) {
		this.outputNames = outputNames;
	}
}

