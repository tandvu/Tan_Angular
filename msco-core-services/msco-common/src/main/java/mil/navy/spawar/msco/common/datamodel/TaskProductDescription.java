package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class TaskProductDescription {
	private String name;
	private String description;
	private String url;
	
	public TaskProductDescription(){}
	
	public TaskProductDescription(String jsonString)
	{
		TaskProductDescription instanceTaskInfo = JsonUtils.createFromJsonString(jsonString, TaskProductDescription.class);
		
		if(instanceTaskInfo != null)
		{
			this.name = instanceTaskInfo.name;
			this.description = instanceTaskInfo.description;
			this.url = instanceTaskInfo.url;
		}
	}

	@Override
	public String toString() {
		return "InstanceTaskInfo [name=" + name + ", description="
				+ description + ", url=" + url + "]";
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getUrl()
	{
		return url;
	}

	public void setUrl(String url)
	{
		this.url = url;
	}
}


