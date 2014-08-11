package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class InstanceVariable {
	private String _id;
	private String processInstanceId;
	private String name;
	private String value;
	private String time;
	
	public InstanceVariable(){}
	
	public InstanceVariable(String jsonString)
	{
		InstanceVariable instanceVariable = JsonUtils.createFromJsonString(jsonString, InstanceVariable.class);
		
		if(instanceVariable != null)
		{
			this._id = instanceVariable._id;
			this.processInstanceId = instanceVariable.processInstanceId;
			this.name = instanceVariable.name;
			this.value = instanceVariable.value;
			this.time = instanceVariable.time;
		}
	}

	@Override
	public String toString() {
		return "InstanceVariable [_id=" + _id + ", processInstanceId="
				+ processInstanceId + ", name=" + name + ", value=" + value
				+ ", time=" + time + "]";
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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
}


