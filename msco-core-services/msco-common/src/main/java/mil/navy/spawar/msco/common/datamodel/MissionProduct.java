package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class MissionProduct {
	private String _id;
	private String missionId;
	private String name;
	private String filename;
	private String description;
	private String role;
	private String taskName;
	private String inputOutput;
	private String assignment;
	private String path;
	private String time;
	private String url;
	
	public MissionProduct(){}
	
	public MissionProduct(String jsonString)
	{
		MissionProduct mission = JsonUtils.createFromJsonString(jsonString, MissionProduct.class);
		
		if(mission != null)
		{
			this._id = mission._id;
			this.missionId = mission.missionId;
			this.name = mission.name;
			this.filename = mission.filename;
			this.description = mission.description;
			this.role = mission.role;
			this.taskName = mission.taskName;
			this.inputOutput = mission.inputOutput;
			this.assignment = mission.assignment;
			this.path = mission.path;
			this.time = mission.time;
			this.url = mission.url;
		}
	}

	@Override
	public String toString()
	{
		return "MissionProduct [_id=" + _id + ", missionId=" + missionId + ", name=" + name + ", fileName=" + filename + ", description=" + description
				+ ", role=" + role + ", taskName=" + taskName + ", inputOutput=" + inputOutput + ", assignment=" + assignment + ", path=" + path + ", time="
				+ time + ", url=" + url + "]";
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

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	public String getInputOutput() {
		return inputOutput;
	}

	public void setInputOutput(String inputOutput) {
		this.inputOutput = inputOutput;
	}

	public String getAssignment() {
		return assignment;
	}

	public void setAssignment(String assignment) {
		this.assignment = assignment;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public String getUrl()
	{
		return url;
	}

	public void setUrl(String url)
	{
		this.url = url;
	}

	public String getFilename()
	{
		return filename;
	}

	public void setFilename(String filename)
	{
		this.filename = filename;
	}
}
