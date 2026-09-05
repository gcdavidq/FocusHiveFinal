from tests.conftest import register_and_login


def _create_collection(client, headers, name="Historia", color="8B5CF6"):
    response = client.post("/api/v1/flashcards/collections", json={"collection_name": name, "collection_color": color}, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_collection_normalizes_color(client, auth):
    collection = _create_collection(client, auth, color="#3b82f6")
    assert collection["collection_color"] == "3B82F6"


def test_create_collection_rejects_bad_color(client, auth):
    response = client.post("/api/v1/flashcards/collections", json={"collection_name": "X", "collection_color": "rojo"}, headers=auth)
    assert response.status_code == 422


def test_cards_crud_inside_collection(client, auth):
    collection = _create_collection(client, auth)
    cid = collection["collection_id"]

    created = client.post(
        f"/api/v1/flashcards/collections/{cid}/cards",
        json={"question": "¿Año de la independencia del Perú?", "answer": "1821"},
        headers=auth,
    )
    assert created.status_code == 201
    card = created.json()
    assert card["card_id"] > 0 and card["collection"] == cid

    listed = client.get("/api/v1/flashcards/collections", headers=auth).json()
    assert len(listed) == 1 and len(listed[0]["flashcards"]) == 1

    updated = client.put(f"/api/v1/flashcards/cards/{card['card_id']}", json={"answer": "28 de julio de 1821"}, headers=auth)
    assert updated.status_code == 200 and updated.json()["answer"] == "28 de julio de 1821"

    assert client.delete(f"/api/v1/flashcards/cards/{card['card_id']}", headers=auth).status_code == 204
    assert client.get(f"/api/v1/flashcards/collections/{cid}", headers=auth).json()["flashcards"] == []


def test_long_question_is_accepted_up_to_255(client, auth):
    cid = _create_collection(client, auth)["collection_id"]
    ok = client.post(f"/api/v1/flashcards/collections/{cid}/cards", json={"question": "a" * 255, "answer": "b"}, headers=auth)
    too_long = client.post(f"/api/v1/flashcards/collections/{cid}/cards", json={"question": "a" * 256, "answer": "b"}, headers=auth)
    assert ok.status_code == 201
    assert too_long.status_code == 422


def test_other_user_cannot_access_collection(client, auth):
    cid = _create_collection(client, auth)["collection_id"]
    intruder = register_and_login(client, "intruso")
    assert client.get(f"/api/v1/flashcards/collections/{cid}", headers=intruder).status_code == 404
    assert client.delete(f"/api/v1/flashcards/collections/{cid}", headers=intruder).status_code == 404
    assert client.post(f"/api/v1/flashcards/collections/{cid}/cards", json={"question": "q", "answer": "a"}, headers=intruder).status_code == 404


def test_delete_collection_removes_its_cards(client, auth):
    cid = _create_collection(client, auth)["collection_id"]
    client.post(f"/api/v1/flashcards/collections/{cid}/cards", json={"question": "q1", "answer": "a1"}, headers=auth)
    client.post(f"/api/v1/flashcards/collections/{cid}/cards", json={"question": "q2", "answer": "a2"}, headers=auth)
    assert client.get("/api/v1/flashcards/stats", headers=auth).json() == {"total_collections": 1, "total_cards": 2}

    assert client.delete(f"/api/v1/flashcards/collections/{cid}", headers=auth).status_code == 204
    assert client.get("/api/v1/flashcards/stats", headers=auth).json() == {"total_collections": 0, "total_cards": 0}
    assert client.get("/api/v1/flashcards/cards", headers=auth).json() == []


def test_flashcard_study_session_is_saved(client, auth):
    cid = _create_collection(client, auth)["collection_id"]
    response = client.post(
        "/api/v1/method-work/flashcard-sessions",
        json={"collection_id": cid, "cards_studied": 5, "cards_easy": 3, "cards_medium": 1, "cards_hard": 1, "duration_minutes": 4},
        headers=auth,
    )
    assert response.status_code == 201
    assert client.get("/api/v1/method-work/flashcard-sessions", headers=auth).json()[0]["cards_easy"] == 3
