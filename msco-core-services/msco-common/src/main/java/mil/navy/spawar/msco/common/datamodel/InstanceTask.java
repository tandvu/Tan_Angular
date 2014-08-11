package mil.navy.spawar.msco.common.datamodel;

import java.util.List;
import mil.navy.spawar.msco.common.JsonUtils;

public class InstanceTask {
	private String _id;
	private String processInstanceId;
	private String missionName;
	private String pesTaskId;
	private String name;
	private String role;
	private String user;
	private String state;
	private String startTime;
	private String stopTime;
	private List<TaskProductDescription> input;
	private List<TaskProductDescription> output;
	
	public InstanceTask(){}
	
	public InstanceTask(String jsonString)
	{
		InstanceTask instanceTask = JsonUtils.createFromJsonString(jsonString, InstanceTask.class);
		
		if(instanceTask != null)
		{
			this._id = instanceTask._id;
			this.processInstanceId = instanceTask.processInstanceId;
			this.missionName = instanceTask.missionName;
			this.pesTaskId = instanceTask.pesTaskId;
			this.name = instanceTask.name;
			this.role = instanceTask.role;
			this.user = instanceTask.user;
			this.state = instanceTask.state;
			this.startTime = instanceTask.startTime;
			this.stopTime = instanceTask.stopTime;
			this.input = instanceTask.input;
			this.output = instanceTask.output;
		}
	}

	@Override
	public String toString()
	{
		return "InstanceTask [_id=" + _id + ", processInstanceId=" + processInstanceId + ", missionName=" + missionName + ", pesTaskId=" + pesTaskId
				+ ", name=" + name + ", role=" + role + ", user=" + user + ", state=" + state + ", startTime=" + startTime + ", stopTime=" + stopTime
				+ ", input=" + input + ", output=" + output + "]";
	}
	
	public String toJsonString()
	{
		return JsonUtils.toJsonString(this);
	}

	public String get_id()
	{
		return _id;
	}

	public void set_id(String _id)
	{
		this._id = _id;
	}

	public String getProcessInstanceId()
	{
		return processInstanceId;
	}

	public void setProcessInstanceId(String processInstanceId)
	{
		this.processInstanceId = processInstanceId;
	}

	public String getMissionName()
	{
		return missionName;
	}

	public void setMissionName(String missionName)
	{
		this.missionName = missionName;
	}

	public String getPesTaskId()
	{
		return pesTaskId;
	}

	public void setPesTaskId(String pesTaskId)
	{
		this.pesTaskId = pesTaskId;
	}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getRole()
	{
		return role;
	}

	public void setRole(String role)
	{
		this.role = role;
	}

	public String getUser()
	{
		return user;
	}

	public void setUser(String user)
	{
		this.user = user;
	}

	public String getState()
	{
		return state;
	}

	public void setState(String state)
	{
		this.state = state;
	}

	public String getStartTime()
	{
		return startTime;
	}

	public void setStartTime(String startTime)
	{
		this.startTime = startTime;
	}

	public String getStopTime()
	{
		return stopTime;
	}

	public void setStopTime(String stopTime)
	{
		this.stopTime = stopTime;
	}

	public List<TaskProductDescription> getInput()
	{
		return input;
	}

	public void setInput(List<TaskProductDescription> input)
	{
		this.input = input;
	}

	public List<TaskProductDescription> getOutput()
	{
		return output;
	}

	public void setOutput(List<TaskProductDescription> output)
	{
		this.output = output;
	}
}

