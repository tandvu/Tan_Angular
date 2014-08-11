package mil.navy.spawar.msco.common.datamodel;

import mil.navy.spawar.msco.common.JsonUtils;

public class PointOfContact {
	private String name;
	private String email;
	private String phone;
	
	public PointOfContact(){}
	
	public PointOfContact(String jsonString)
	{
		PointOfContact mission = JsonUtils.createFromJsonString(jsonString, PointOfContact.class);
		
		if(mission != null)
		{
			this.name = mission.name;
			this.email = mission.email;
			this.phone = mission.phone;
		}
	}

	@Override
	public String toString() {
		return "PointOfContact [name=" + name + ", email=" + email + ", phone="
				+ phone + "]";
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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
}
