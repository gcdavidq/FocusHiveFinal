from tests.conftest import register_and_login


def test_calendar_block_crud(client, auth):
    created = client.post(
        "/api/v1/calendar/blocks",
        json={"day_of_week": "martes", "start_time": "18:00", "end_time": "19:30", "method": "cornell", "subject": "Física"},
        headers=auth,
    )
    assert created.status_code == 201, created.text
    block = created.json()
    assert block["start_time"] == "18:00" and block["end_time"] == "19:30"

    listed = client.get("/api/v1/calendar/blocks", headers=auth).json()
    assert len(listed) == 1

    updated = client.put(f"/api/v1/calendar/blocks/{block['block_id']}", json={"end_time": "20:00", "notes": "Repaso"}, headers=auth)
    assert updated.status_code == 200 and updated.json()["end_time"] == "20:00"

    assert client.put(f"/api/v1/calendar/blocks/{block['block_id']}", json={"end_time": "17:00"}, headers=auth).status_code == 422

    assert client.delete(f"/api/v1/calendar/blocks/{block['block_id']}", headers=auth).status_code == 204
    assert client.get("/api/v1/calendar/blocks", headers=auth).json() == []


def test_calendar_validation(client, auth):
    bad_day = client.post("/api/v1/calendar/blocks", json={"day_of_week": "funday", "start_time": "08:00", "end_time": "09:00", "method": "pomodoro"}, headers=auth)
    bad_range = client.post("/api/v1/calendar/blocks", json={"day_of_week": "lunes", "start_time": "09:00", "end_time": "08:00", "method": "pomodoro"}, headers=auth)
    assert bad_day.status_code == 422
    assert bad_range.status_code == 422


def test_calendar_clear_only_affects_owner(client, auth):
    other = register_and_login(client, "otra_persona")
    for headers in (auth, other):
        client.post("/api/v1/calendar/blocks", json={"day_of_week": "lunes", "start_time": "08:00", "end_time": "09:00", "method": "pomodoro"}, headers=headers)
    assert client.delete("/api/v1/calendar/blocks", headers=auth).status_code == 204
    assert client.get("/api/v1/calendar/blocks", headers=auth).json() == []
    assert len(client.get("/api/v1/calendar/blocks", headers=other).json()) == 1


def test_feynman_work_lifecycle(client, auth):
    created = client.post("/api/v1/method-work/feynman", json={"topic": "Fotosíntesis"}, headers=auth)
    assert created.status_code == 201
    fid = created.json()["feynman_id"]
    updated = client.put(f"/api/v1/method-work/feynman/{fid}", json={"explanation": "Las plantas...", "is_completed": True}, headers=auth)
    assert updated.json()["is_completed"] is True
    assert client.get("/api/v1/method-work/feynman", headers=auth).json()[0]["topic"] == "Fotosíntesis"
    assert client.delete(f"/api/v1/method-work/feynman/{fid}", headers=auth).status_code == 204


def test_cornell_note_is_private(client, auth):
    created = client.post("/api/v1/method-work/cornell", json={"title": "Clase 1", "notes_section": "..."}, headers=auth)
    assert created.status_code == 201
    note_id = created.json()["note_id"]
    intruder = register_and_login(client, "curioso")
    assert client.get(f"/api/v1/method-work/cornell/{note_id}", headers=intruder).status_code == 404
    assert client.get(f"/api/v1/method-work/cornell/{note_id}", headers=auth).status_code == 200
