from datetime import datetime, timedelta, timezone


def _session(client, headers, method="pomodoro", minutes=25, when=None, **extra):
    when = when or datetime.now(timezone.utc) - timedelta(minutes=minutes)
    payload = {"metodo": method, "fecha_inicio": when.isoformat(), "duracion_minutos": minutes, **extra}
    response = client.post("/api/v1/dashboard/sessions", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_session_by_method_name_unlocks_first_achievement(client, auth, seeded):
    body = _session(client, auth, descripcion="Álgebra")
    assert body["session"]["metodo_nombre"] == "pomodoro"
    assert body["session"]["metodo_titulo"] == "Técnica Pomodoro"
    assert "first_session" in body["new_achievements"]

    second = _session(client, auth)
    assert "first_session" not in second["new_achievements"]


def test_create_session_unknown_method_is_404(client, auth, seeded):
    response = client.post(
        "/api/v1/dashboard/sessions",
        json={"metodo": "osmosis", "fecha_inicio": "2026-01-01T10:00:00Z", "duracion_minutos": 10},
        headers=auth,
    )
    assert response.status_code == 404


def test_create_session_rejects_future_date_and_missing_method(client, auth, seeded):
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    assert client.post("/api/v1/dashboard/sessions", json={"metodo": "pomodoro", "fecha_inicio": future, "duracion_minutos": 10}, headers=auth).status_code == 422
    assert client.post("/api/v1/dashboard/sessions", json={"fecha_inicio": "2026-01-01T10:00:00Z", "duracion_minutos": 10}, headers=auth).status_code == 422


def test_summary_reflects_today_week_and_streak(client, auth, seeded):
    _session(client, auth, "pomodoro", 30)
    _session(client, auth, "feynman", 60)
    summary = client.get("/api/v1/dashboard/summary", headers=auth).json()

    assert summary["today_minutes"] == 90
    assert summary["today_sessions"] == 2
    assert summary["week_minutes"] == 90
    assert summary["total_studied_time"] == 90
    assert summary["study_streak"]["current_streak"] == 1
    assert summary["most_used_method"]["metodo_nombre"] == "feynman"
    assert len(summary["weekly_progress"]["daily_breakdown"]) == 7
    assert sum(d["total_minutes"] for d in summary["weekly_progress"]["daily_breakdown"]) == 90
    assert summary["weekly_goal_hours"] == 10.0
    assert summary["week_goal_progress"] == 15.0
    assert "first_session" in summary["achievements"]


def test_streak_counts_consecutive_days(client, auth, seeded):
    now = datetime.now(timezone.utc).replace(hour=12)
    for days_ago in (0, 1, 2):
        _session(client, auth, when=now - timedelta(days=days_ago), minutes=20)
    summary = client.get("/api/v1/dashboard/summary", headers=auth).json()
    assert summary["study_streak"]["current_streak"] == 3
    assert summary["study_streak"]["longest_streak"] == 3
    assert "streak_3" in summary["achievements"]


def test_history_pagination_and_delete_adjusts_total(client, auth, seeded):
    ids = [_session(client, auth, minutes=10)["session"]["session_id"] for _ in range(3)]
    history = client.get("/api/v1/dashboard/sessions/history?skip=0&limit=2", headers=auth).json()
    assert history["total_count"] == 3 and history["pages"] == 2 and len(history["sessions"]) == 2

    assert client.delete(f"/api/v1/dashboard/sessions/{ids[0]}", headers=auth).status_code == 200
    assert client.get(f"/api/v1/dashboard/sessions/{ids[0]}", headers=auth).status_code == 404
    assert client.get("/api/v1/users/me", headers=auth).json()["total_studied_time"] == 20


def test_update_session_recomputes_total_time(client, auth, seeded):
    created = _session(client, auth, minutes=10)["session"]
    response = client.put(
        f"/api/v1/dashboard/sessions/{created['session_id']}",
        json={"metodo": "cornell", "fecha_inicio": created["fecha_inicio"], "duracion_minutos": 45},
        headers=auth,
    )
    assert response.status_code == 200
    assert response.json()["metodo_nombre"] == "cornell"
    assert client.get("/api/v1/users/me", headers=auth).json()["total_studied_time"] == 45


def test_level_increases_every_ten_hours(client, auth, seeded):
    _session(client, auth, minutes=600)
    assert client.get("/api/v1/users/me", headers=auth).json()["level"] == 2


def test_all_methods_achievement(client, auth, seeded):
    for method in ("pomodoro", "feynman", "cornell", "flashcards"):
        body = _session(client, auth, method, 15)
    assert "all_methods" in body["new_achievements"]
    stats = client.get("/api/v1/dashboard/stats/methods", headers=auth).json()
    assert stats["total_methods_used"] == 4
    assert all(m["percentage"] == 25.0 for m in stats["methods"])


def test_preferences_update_can_unlock_week_goal(client, auth, seeded):
    _session(client, auth, minutes=120)
    assert client.get("/api/v1/dashboard/preferences", headers=auth).json()["weekly_goal_hours"] == 10.0
    response = client.put("/api/v1/dashboard/preferences", json={"weekly_goal_hours": 2}, headers=auth)
    assert response.status_code == 200
    assert "week_goal" in response.json()["achievements"]
    assert client.put("/api/v1/dashboard/preferences", json={"weekly_goal_hours": 0}, headers=auth).status_code == 422


def test_monthly_stats_and_most_productive_day(client, auth, seeded):
    when = datetime(2026, 3, 10, 15, 0, tzinfo=timezone.utc)  # martes
    _session(client, auth, minutes=50, when=when)
    _session(client, auth, minutes=10, when=when + timedelta(days=1))
    stats = client.get("/api/v1/dashboard/stats/monthly?month=3&year=2026", headers=auth).json()
    assert stats["total_sessions"] == 2 and stats["total_minutes"] == 60
    assert stats["average_session_duration"] == 30.0
    assert stats["most_productive_day"] == "Martes"


def test_achievements_catalog_is_public(client):
    codes = [a["code"] for a in client.get("/api/v1/dashboard/achievements").json()]
    assert "first_session" in codes and "streak_7" in codes
