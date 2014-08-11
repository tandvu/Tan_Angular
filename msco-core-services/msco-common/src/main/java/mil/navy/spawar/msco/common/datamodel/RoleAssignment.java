package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class RoleAssignment {
	private String _id;
	private String role;
	private String assignment;
	private String time;
	
	public RoleAssignment(){}
	
	public RoleAssignment(String jsonString)
	{
		RoleAssignment roleAssignment = JsonUtils.createFromJsonString(jsonString, RoleAssignment.class);
		
		if(roleAssignment != null)
		{
			this._id = roleAssignment._id;
			this.role = roleAssignment.role;
			this.assignment = roleAssignment.assignment;
			this.time = roleAssignment.time;
		}
	}

	@Override
	public String toString()
	{
		return "RoleAssignment [_id=" + _id + ", role=" + role + ", assignment=" + assignment + ", time=" + time + "]";
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

	public String getRole()
	{
		return role;
	}

	public void setRole(String role)
	{
		this.role = role;
	}

	public String getAssignment()
	{
		return assignment;
	}

	public void setAssignment(String assignment)
	{
		this.assignment = assignment;
	}

	public String getTime()
	{
		return time;
	}

	public void setTime(String time)
	{
		this.time = time;
	}
}



