package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class Mission {
	private String _id;
	private String name;
	private String processName;
	private String deploymentId;
	private String processId;
	private String time;
	
	public Mission(){}
	
	public Mission(String jsonString)
	{
		Mission mission = JsonUtils.createFromJsonString(jsonString, Mission.class);
		
		if(mission != null)
		{
			this._id = mission._id;
			this.name = mission.name;
			this.processName = mission.processName;
			this.deploymentId = mission.deploymentId;
			this.processId = mission.processId;
			this.time = mission.time;
		}
	}

	@Override
	public String toString() {
		return "Mission [_id=" + _id + ", name=" + name + ", processName="
				+ processName + ", deploymentId=" + deploymentId
				+ ", processId=" + processId + ", time=" + time + "]";
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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getProcessName() {
		return processName;
	}

	public void setProcessName(String processName) {
		this.processName = processName;
	}

	public String getDeploymentId() {
		return deploymentId;
	}

	public void setDeploymentId(String deploymentId) {
		this.deploymentId = deploymentId;
	}

	public String getProcessId() {
		return processId;
	}

	public void setProcessId(String processId) {
		this.processId = processId;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
}
