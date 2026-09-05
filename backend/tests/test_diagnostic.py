def _answers_for(questions, method_index: int):
    """Elige la opción en la posición `method_index` de cada pregunta (el seed las ordena por método)."""
    return [{"question_id": q["question_id"], "option_id": q["options"][method_index]["option_id"]} for q in questions]


def test_methods_catalog(client, seeded):
    response = client.get("/api/v1/methods")
    assert response.status_code == 200
    assert [m["nombre"] for m in response.json()] == ["pomodoro", "feynman", "cornell", "flashcards"]


def test_questions_require_seed(client, auth):
    response = client.get("/api/v1/diagnostic/questions", headers=auth)
    assert response.status_code == 404


def test_questions_are_ordered_with_four_options(client, auth, seeded):
    response = client.get("/api/v1/diagnostic/questions", headers=auth)
    assert response.status_code == 200
    body = response.json()
    assert body["total_questions"] == 8
    orders = [q["question_order"] for q in body["questions"]]
    assert orders == sorted(orders)
    assert all(len(q["options"]) == 4 for q in body["questions"])


def test_submit_requires_all_answers(client, auth, seeded):
    questions = client.get("/api/v1/diagnostic/questions", headers=auth).json()["questions"]
    response = client.post("/api/v1/diagnostic/submit", json={"answers": _answers_for(questions, 0)[:3]}, headers=auth)
    assert response.status_code == 400


def test_submit_rejects_option_from_another_question(client, auth, seeded):
    questions = client.get("/api/v1/diagnostic/questions", headers=auth).json()["questions"]
    answers = _answers_for(questions, 0)
    answers[0]["option_id"] = questions[1]["options"][0]["option_id"]
    response = client.post("/api/v1/diagnostic/submit", json={"answers": answers}, headers=auth)
    assert response.status_code == 400


def test_full_diagnostic_flow_recommends_feynman(client, auth, seeded):
    assert client.get("/api/v1/diagnostic/status", headers=auth).json()["diagnostic_completed"] is False

    questions = client.get("/api/v1/diagnostic/questions", headers=auth).json()["questions"]
    response = client.post("/api/v1/diagnostic/submit", json={"answers": _answers_for(questions, 1)}, headers=auth)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["primary_method"]["method_name"] == "feynman"
    assert body["primary_method"]["score"] == body["all_scores"]["feynman"]
    assert body["secondary_method"] is None
    assert len(body["primary_method"]["tips"]) >= 3

    status_body = client.get("/api/v1/diagnostic/status", headers=auth).json()
    assert status_body["diagnostic_completed"] is True
    assert status_body["recommended_method_name"] == "feynman"

    stored = client.get("/api/v1/diagnostic/result", headers=auth).json()
    assert stored["primary_method"]["method_name"] == "feynman"
    assert stored["all_scores"] == body["all_scores"]

    me = client.get("/api/v1/auth/me", headers=auth).json()
    assert me["diagnostic_completed"] is True


def test_result_404_before_completing(client, auth, seeded):
    assert client.get("/api/v1/diagnostic/result", headers=auth).status_code == 404


def test_retaking_diagnostic_replaces_previous_result(client, auth, seeded):
    questions = client.get("/api/v1/diagnostic/questions", headers=auth).json()["questions"]
    client.post("/api/v1/diagnostic/submit", json={"answers": _answers_for(questions, 0)}, headers=auth)
    second = client.post("/api/v1/diagnostic/submit", json={"answers": _answers_for(questions, 3)}, headers=auth)
    assert second.json()["primary_method"]["method_name"] == "flashcards"
    assert client.get("/api/v1/diagnostic/status", headers=auth).json()["recommended_method_name"] == "flashcards"
