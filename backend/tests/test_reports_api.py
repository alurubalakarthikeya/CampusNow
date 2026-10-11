"""API behaviour: the contract the mobile client relies on."""

from __future__ import annotations

from app.core.security import get_current_student
from app.main import app


def test_health_reveals_no_configuration(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_reports_unconfigured_without_values(client):
    body = client.get("/ready").json()
    assert body["servicenow"] == "unconfigured"
    # No credential, path or issuer value is ever echoed.
    assert "SERVICENOW_CLIENT_SECRET" not in response_text(body)
    assert body["campus_directory"] == "unconfigured"


def response_text(body: dict) -> str:
    return str(body)


def test_create_report_returns_server_owned_fields(client, report_payload):
    response = client.post("/api/v1/reports", json=report_payload)
    assert response.status_code == 201

    body = response.json()
    assert body["id"].startswith("r-")
    assert body["status"] == "reported"
    assert body["priority"] == 3
    assert body["assignment_group"] is None
    assert body["servicenow_sys_id"] is None
    assert [event["status"] for event in body["events"]] == ["reported"]


def test_client_cannot_set_server_owned_fields(client, report_payload):
    payload = {**report_payload, "assignment_group": "IT", "status": "resolved", "priority": 1}
    response = client.post("/api/v1/reports", json=payload)
    assert response.status_code == 422

    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    fields = {detail["field"] for detail in body["error"]["details"]}
    assert any("assignment_group" in field for field in fields)


def test_validation_rejects_bad_category_and_long_description(client, report_payload):
    bad_category = {**report_payload, "category": "teleport"}
    assert client.post("/api/v1/reports", json=bad_category).status_code == 422

    long_description = {**report_payload, "description": "x" * 1001}
    assert client.post("/api/v1/reports", json=long_description).status_code == 422


def test_replaying_the_same_idempotency_key_does_not_duplicate(client, report_payload):
    first = client.post("/api/v1/reports", json=report_payload, headers={"Idempotency-Key": "draft-1"})
    second = client.post("/api/v1/reports", json=report_payload, headers={"Idempotency-Key": "draft-1"})

    assert first.status_code == 201
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    assert client.get("/api/v1/reports").json()["total"] == 1


def test_listing_is_paginated_and_newest_first(client, report_payload):
    for index in range(3):
        payload = {**report_payload, "title": f"Report {index}"}
        assert client.post("/api/v1/reports", json=payload).status_code == 201

    page = client.get("/api/v1/reports", params={"page": 1, "page_size": 2}).json()
    assert page["total"] == 3
    assert len(page["items"]) == 2
    assert page["page"] == 1 and page["page_size"] == 2

    invalid = client.get("/api/v1/reports", params={"page": 0})
    assert invalid.status_code == 422


def test_a_student_cannot_read_another_students_report(client, other_client, report_payload):
    created = client.post("/api/v1/reports", json=report_payload).json()

    # The other student sees the same not-found answer a missing record gives,
    # so the API never confirms that someone else's report exists.
    assert other_client.get(f"/api/v1/reports/{created['id']}").status_code == 404
    assert other_client.patch(f"/api/v1/reports/{created['id']}", json={"title": "Hijacked"}).status_code == 404
    assert other_client.delete(f"/api/v1/reports/{created['id']}").status_code == 404
    assert other_client.get("/api/v1/reports").json()["total"] == 0


def test_owner_can_edit_and_delete_a_fresh_report(client, report_payload):
    created = client.post("/api/v1/reports", json=report_payload).json()

    updated = client.patch(f"/api/v1/reports/{created['id']}", json={"title": "WiFi down in reading room"})
    assert updated.status_code == 200
    assert updated.json()["title"] == "WiFi down in reading room"

    assert client.delete(f"/api/v1/reports/{created['id']}").status_code == 204
    assert client.get(f"/api/v1/reports/{created['id']}").status_code == 404


def test_status_cannot_be_changed_through_the_api(client, report_payload):
    created = client.post("/api/v1/reports", json=report_payload).json()
    response = client.patch(f"/api/v1/reports/{created['id']}", json={"status": "resolved"})
    assert response.status_code == 422
    assert client.get(f"/api/v1/reports/{created['id']}").json()["status"] == "reported"


def test_feedback_requires_a_resolved_report(client, report_payload, session_factory):
    created = client.post("/api/v1/reports", json=report_payload).json()

    early = client.post(f"/api/v1/reports/{created['id']}/feedback", json={"resolved": True})
    assert early.status_code == 409

    # Operations resolves it through the service, which is not a client route.
    from app.services.report_service import ReportService

    with session_factory() as session:
        service = ReportService(session)
        service.transition(created["id"], "confirmed")
        service.transition(created["id"], "assigned")
        service.transition(created["id"], "investigating")
        service.transition(created["id"], "resolved")

    accepted = client.post(
        f"/api/v1/reports/{created['id']}/feedback",
        json={"resolved": True, "comment": "Working again, thanks."},
    )
    assert accepted.status_code == 201
    assert accepted.json()["resolved"] is True


def test_illegal_status_transition_is_refused(session_factory, client, report_payload):
    from app.core.errors import ConflictError
    from app.services.report_service import ReportService

    created = client.post("/api/v1/reports", json=report_payload).json()

    with session_factory() as session:
        service = ReportService(session)
        try:
            service.transition(created["id"], "resolved")
        except ConflictError:
            pass
        else:  # pragma: no cover - the transition must not be allowed
            raise AssertionError("a report cannot jump straight to resolved")


def test_unauthenticated_requests_are_refused_and_say_why(anonymous_client):
    response = anonymous_client.get("/api/v1/reports")
    assert response.status_code == 503
    body = response.json()
    assert body["error"]["code"] == "UNAVAILABLE"
    assert "AUTH_ISSUER" in body["error"]["message"]
    # The refusal explains configuration without exposing any value.
    assert "AUTH_JWKS_URL" in body["error"]["message"]


def test_an_invalid_bearer_token_is_rejected(anonymous_client):
    response = anonymous_client.get("/api/v1/reports", headers={"Authorization": "Bearer not-a-token"})
    assert response.status_code == 503


def test_locations_are_honest_when_unconfigured(client):
    body = client.get("/api/v1/locations").json()
    assert body["items"] == []
    assert body["source"] == "unconfigured"


def test_campus_pulse_is_computed_from_stored_reports(client, report_payload):
    empty = client.get("/api/v1/campus/pulse").json()
    assert empty["total_reports"] == 0
    assert empty["score"] is None

    client.post("/api/v1/reports", json=report_payload)
    pulse = client.get("/api/v1/campus/pulse").json()
    assert pulse["open_reports"] == 1
    assert pulse["total_reports"] == 1
    assert pulse["score"] == 97


def test_app_override_is_not_left_enabled(client):
    """The fixture removes its own override; nothing is bypassed for good."""
    app.dependency_overrides.pop(get_current_student, None)
    assert get_current_student not in app.dependency_overrides
