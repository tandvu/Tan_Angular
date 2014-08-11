package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class DataProduct {
	private String name;
	private String path;
	private String lastModificationTime;
	private String id;
	private String url;
	private String version;
	private String contentType;
	
	private String exerciseName;
	private String missionName;
	private String taskName;
	
	public DataProduct() {}
	
	public DataProduct(String jsonString)
	{
		DataProduct dataProduct = JsonUtils.createFromJsonString(jsonString, DataProduct.class);
		
		if(dataProduct != null)
		{
			this.name = dataProduct.name;
			this.path = dataProduct.path;
			this.lastModificationTime = dataProduct.lastModificationTime;
			this.id = dataProduct.id;
			
			this.url = dataProduct.url;
			this.version = dataProduct.version;
			this.contentType = dataProduct.contentType;
			this.exerciseName = dataProduct.exerciseName;
			this.missionName = dataProduct.missionName;
			this.taskName = dataProduct.taskName;
		}
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
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public String getExerciseName() {
		return exerciseName;
	}
	public void setExerciseName(String exerciseName) {
		this.exerciseName = exerciseName;
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
	public String getLastModificationTime() {
		return lastModificationTime;
	}
	public void setLastModificationTime(String lastModificationTime) {
		this.lastModificationTime = lastModificationTime;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	@Override
	public String toString() {
		return "DataProduct [name=" + name + ", path=" + path
				+ ", lastModificationTime=" + lastModificationTime + ", id="
				+ id + ", url=" + url + ", version=" + version
				+ ", contentType=" + contentType + ", exerciseName="
				+ exerciseName + ", missionName=" + missionName + ", taskName="
				+ taskName + "]";
	}
}
