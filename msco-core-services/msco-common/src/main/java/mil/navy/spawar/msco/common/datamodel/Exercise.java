package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class Exercise {
	private String _id;
	private String name;
	private String command;
	private String description;
	private PointOfContact poc;				
	private String startTime;
	private String stopTime;
	private VmWorkingStatus vmWorkingStatus; 
	private String filepath;
	private String time;
	
	public Exercise(){}
	
	public Exercise(String jsonString)
	{
		Exercise exercise = JsonUtils.createFromJsonString(jsonString, Exercise.class);
		
		if(exercise != null)
		{
			this._id = exercise._id;
			this.name = exercise.name;
			this.command = exercise.command;
			this.description = exercise.description;
			this.poc = exercise.poc;
			this.startTime = exercise.stopTime;
			this.stopTime = exercise.stopTime;
			this.vmWorkingStatus = exercise.vmWorkingStatus;
			this.filepath = exercise.filepath;
			this.time = exercise.time;
		}
	}
	
	@Override
	public String toString() {
		return "Exercise [_id=" + _id + ", name=" + name + ", command="
				+ command + ", description=" + description + ", poc=" + poc
				+ ", startTime=" + startTime + ", stopTime=" + stopTime
				+ ", vmWorkingStatus=" + vmWorkingStatus + ", filepath="
				+ filepath + ", time=" + time + "]";
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

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public PointOfContact getPoc() {
		return poc;
	}

	public void setPoc(PointOfContact poc) {
		this.poc = poc;
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

	public VmWorkingStatus getVmWorkingStatus() {
		return vmWorkingStatus;
	}

	public void setVmWorkingStatus(VmWorkingStatus vmWorkingStatus) {
		this.vmWorkingStatus = vmWorkingStatus;
	}

	public String getFilepath() {
		return filepath;
	}

	public void setFilepath(String filepath) {
		this.filepath = filepath;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
}
