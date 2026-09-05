from tests.conftest import DEFAULT_PASSWORD, register_and_login


def test_register_returns_user_without_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "nuevo_user", "email": "nuevo@example.com", "password": DEFAULT_PASSWORD, "confirm_password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["username"] == "nuevo_user"
    assert body["user"]["diagnostic_completed"] is False
    assert "password" not in body["user"] and "password_hash" not in body["user"]


def test_register_rejects_duplicate_username(client):
    register_and_login(client, "repetido")
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "repetido", "email": "otro@example.com", "password": DEFAULT_PASSWORD, "confirm_password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 400
    assert "username" in response.json()["detail"].lower()


def test_register_rejects_weak_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "debil", "email": "debil@example.com", "password": "solominusculas", "confirm_password": "solominusculas"},
    )
    assert response.status_code == 422


def test_register_rejects_password_mismatch(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "mismatch", "email": "m@example.com", "password": DEFAULT_PASSWORD, "confirm_password": "Otra12345"},
    )
    assert response.status_code == 422


def test_login_with_username_and_with_email(client):
    register_and_login(client, "flexible")
    by_username = client.post("/api/v1/auth/login", json={"username": "flexible", "password": DEFAULT_PASSWORD})
    by_email = client.post("/api/v1/auth/login", json={"username": "flexible@example.com", "password": DEFAULT_PASSWORD})
    assert by_username.status_code == 200
    assert by_email.status_code == 200
    assert by_email.json()["user"]["username"] == "flexible"


def test_login_wrong_password_is_401(client):
    register_and_login(client, "seguro")
    response = client.post("/api/v1/auth/login", json={"username": "seguro", "password": "Incorrecta1"})
    assert response.status_code == 401


def test_me_requires_valid_token(client, auth):
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token-falso"}).status_code == 401
    response = client.get("/api/v1/auth/me", headers=auth)
    assert response.status_code == 200
    assert response.json()["username"] == "ana_estudia"
