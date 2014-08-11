package mil.navy.spawar.msco.common.datamodel;

import java.util.List;
import mil.navy.spawar.msco.common.JsonUtils;

public class MissionProductLogEntry {
	private String _id;
	private String processInstanceId;
	private String instanceTaskId;
	private List<String> prevTaskIds;
	private String missionName;
	private String taskName;
	private String productName;
	private String productDescription;
	private String path;
	private String url;
	private String fileSizeBytes;
	private String user;
	private String time;
	
	public MissionProductLogEntry(){}
	
	public MissionProductLogEntry(String jsonString)
	{
		MissionProductLogEntry mission = JsonUtils.createFromJsonString(jsonString, MissionProductLogEntry.class);
		
		if(mission != null)
		{
			this._id = mission._id;
			this.processInstanceId = mission.processInstanceId;
			this.instanceTaskId = mission.instanceTaskId;
			this.productName = mission.productName;
			this.productDescription = mission.productDescription;
			this.path = mission.path;
			this.fileSizeBytes = mission.fileSizeBytes;
			this.user = mission.user;
			this.missionName = mission.missionName;
			this.taskName = mission.taskName;
			this.time = mission.time;
			this.prevTaskIds = mission.prevTaskIds;
			this.url = mission.url;
		}
	}

	@Override
	public String toString()
	{
		return "MissionProductLogEntry [_id=" + _id + ", processInstanceId=" + processInstanceId + ", instanceTaskId=" + instanceTaskId + ", prevTaskIds="
				+ prevTaskIds + ", missionName=" + missionName + ", taskName=" + taskName + ", productName=" + productName + ", productDescription="
				+ productDescription + ", path=" + path + ", url=" + url + ", fileSizeBytes=" + fileSizeBytes + ", user=" + user + ", time=" + time + "]";
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

	public List<String> getPrevTaskIds() {
		return prevTaskIds;
	}

	public void setPrevTaskIds(List<String> prevTaskIds) {
		this.prevTaskIds = prevTaskIds;
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

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public String getProductDescription() {
		return productDescription;
	}

	public void setProductDescription(String productDescription) {
		this.productDescription = productDescription;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getFileSizeBytes() {
		return fileSizeBytes;
	}

	public void setFileSizeBytes(String fileSizeBytes) {
		this.fileSizeBytes = fileSizeBytes;
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

	public String getUrl()
	{
		return url;
	}

	public void setUrl(String url)
	{
		this.url = url;
	}
}
