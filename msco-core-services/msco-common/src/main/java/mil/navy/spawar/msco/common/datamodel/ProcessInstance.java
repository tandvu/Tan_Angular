package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class ProcessInstance {
	private String _id;
	private String missionId;
	private String pesInstanceId;
	private String name;
	private String state;
	private String startTime;
	private String stopTime;
	
	public ProcessInstance(){}
	
	public ProcessInstance(String jsonString)
	{
		ProcessInstance processInstance = JsonUtils.createFromJsonString(jsonString, ProcessInstance.class);
		
		if(processInstance != null)
		{
			this._id = processInstance._id;
			this.missionId = processInstance.missionId;
			this.pesInstanceId = processInstance.pesInstanceId;
			this.name = processInstance.name;
			this.state = processInstance.state;
			this.startTime = processInstance.startTime;
			this.stopTime = processInstance.stopTime;
		}
	}

	@Override
	public String toString() {
		return "ProcessInstance [_id=" + _id + ", missionId=" + missionId
				+ ", pesInstanceId=" + pesInstanceId + ", name=" + name
				+ ", state=" + state + ", startTime=" + startTime
				+ ", stopTime=" + stopTime + "]";
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

	public String getMissionId() {
		return missionId;
	}

	public void setMissionId(String missionId) {
		this.missionId = missionId;
	}

	public String getPesInstanceId() {
		return pesInstanceId;
	}

	public void setPesInstanceId(String pesInstanceId) {
		this.pesInstanceId = pesInstanceId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getStopTime() {
		return stopTime;
	}

	public void setStopTime(String stopTime) {
		this.stopTime = stopTime;
	}
}
