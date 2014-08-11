package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class ErrorLogEntry {
	private String _id;
	private String level;
	private String message;
	private String time;
	
	public ErrorLogEntry(){}
	
	public ErrorLogEntry(String jsonString)
	{
		ErrorLogEntry errorLogEntry = JsonUtils.createFromJsonString(jsonString, ErrorLogEntry.class);
		
		if(errorLogEntry != null)
		{
			this._id = errorLogEntry._id;
			this.level = errorLogEntry.level;
			this.message = errorLogEntry.message;
			this.time = errorLogEntry.time;
		}
	}

	@Override
	public String toString() {
		return "ErrorLogEntry [_id=" + _id + ", level=" + level + ", message="
				+ message + ", time=" + time + "]";
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

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
}


