from app import models


def test_list_thrust_areas(client, db):
    db.add(models.ThrustArea(name="Sales Revenue"))
    db.add(models.ThrustArea(name="Safety Compliance"))
    db.commit()

    response = client.get("/api/v1/thrust-areas/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {item["name"] for item in data} == {"Sales Revenue", "Safety Compliance"}
    assert all("id" in item for item in data)
