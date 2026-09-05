from tests.conftest import DEFAULT_PASSWORD, register_and_login


def test_update_profile_partial(client, auth):
    response = client.put("/api/v1/users/me", json={"full_name": "Ana Pérez", "bio": "Estudiante"}, headers=auth)
    assert response.status_code == 200
    assert response.json()["user"]["full_name"] == "Ana Pérez"
    assert response.json()["user"]["username"] == "ana_estudia"


def test_update_profile_rejects_taken_username(client, auth):
    register_and_login(client, "ocupado")
    response = client.put("/api/v1/users/me", json={"username": "ocupado"}, headers=auth)
    assert response.status_code == 400


def test_update_profile_rejects_invalid_avatar(client, auth):
    response = client.put("/api/v1/users/me", json={"avatar_url": "ftp://x/imagen.bmp"}, headers=auth)
    assert response.status_code == 400


def test_change_password_then_login_with_new_one(client, auth):
    response = client.patch(
        "/api/v1/users/me/password",
        json={"current_password": DEFAULT_PASSWORD, "new_password": "Nueva1234", "confirm_new_password": "Nueva1234"},
        headers=auth,
    )
    assert response.status_code == 200
    assert client.post("/api/v1/auth/login", json={"username": "ana_estudia", "password": "Nueva1234"}).status_code == 200
    assert client.post("/api/v1/auth/login", json={"username": "ana_estudia", "password": DEFAULT_PASSWORD}).status_code == 401


def test_delete_account_cascades_related_data(client, auth, seeded):
    collection = client.post("/api/v1/flashcards/collections", json={"collection_name": "Bio"}, headers=auth).json()
    client.post(
        f"/api/v1/flashcards/collections/{collection['collection_id']}/cards",
        json={"question": "¿Qué es una célula?", "answer": "La unidad básica de la vida"},
        headers=auth,
    )
    client.post(
        "/api/v1/dashboard/sessions",
        json={"metodo": "pomodoro", "fecha_inicio": "2026-01-10T10:00:00Z", "duracion_minutos": 25},
        headers=auth,
    )
    client.post(
        "/api/v1/calendar/blocks",
        json={"day_of_week": "lunes", "start_time": "08:00", "end_time": "09:00", "method": "pomodoro"},
        headers=auth,
    )

    response = client.delete("/api/v1/users/me", headers=auth)
    assert response.status_code == 200, response.text
    assert client.get("/api/v1/auth/me", headers=auth).status_code == 401
    assert client.post("/api/v1/auth/login", json={"username": "ana_estudia", "password": DEFAULT_PASSWORD}).status_code == 401


def test_cannot_delete_other_users(client, auth):
    other = client.get("/api/v1/auth/me", headers=register_and_login(client, "victima")).json()
    response = client.delete(f"/api/v1/users/{other['user_id']}", headers=auth)
    assert response.status_code == 405
