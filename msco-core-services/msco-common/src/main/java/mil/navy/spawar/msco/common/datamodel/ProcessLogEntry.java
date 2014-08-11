package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class ProcessLogEntry {
	private String _id;
	private String processInstanceId;
	private String instanceTaskId;
	private String missionName;
	private String taskName;
	private String message;
	private String user;
	private String time;
	
	public ProcessLogEntry(){}
	
	public ProcessLogEntry(String jsonString)
	{
		ProcessLogEntry process = JsonUtils.createFromJsonString(jsonString, ProcessLogEntry.class);
		
		if(process != null)
		{
			this._id = process._id;
			this.processInstanceId = process.processInstanceId;
			this.instanceTaskId = process.instanceTaskId;
			this.missionName = process.missionName;
			this.taskName = process.taskName;
			this.message = process.message;
			this.user = process.user;
			this.time = process.time;
		}
	}

	@Override
	public String toString() {
		return "ProcessLogEntry [_id=" + _id + ", processInstanceId="
				+ processInstanceId + ", instanceTaskId=" + instanceTaskId
				+ ", missionName=" + missionName + ", taskName=" + taskName
				+ ", message=" + message + ", user=" + user + ", time=" + time
				+ "]";
	}
	
	public String toJsonString()
	{
		return JsonUtils.toJsonString(this);
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String getProcessInstanceId() {
		return processInstanceId;
	}

	public void setProcessInstanceId(String processInstanceId) {
		this.processInstanceId = processInstanceId;
	}

	public String getInstanceTaskId() {
		return instanceTaskId;
	}

	public void setInstanceTaskId(String instanceTaskId) {
		this.instanceTaskId = instanceTaskId;
	}

	public String getMissionName() {
		return missionName;
	}

	public void setMissionName(String missionName) {
		this.missionName = missionName;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
}

