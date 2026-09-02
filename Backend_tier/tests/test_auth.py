import pytest
from fastapi.testclient import TestClient

from src.routers import auth
from src import common, main

@pytest.fixture
def client():
    app_instance = getattr(main, "app", main)
    return TestClient(app_instance)

@pytest.fixture(autouse=True)
def env_vars_mock(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "SuperSecretKey")
    monkeypatch.setenv("ALGORITHM", "HS256")

@pytest.fixture
def db_connect(mocker):
    mock_connect = mocker.patch("src.routers.auth.connect")
    cursor = mock_connect.return_value.cursor.return_value.__enter__.return_value
    cursor.mock_connect = mock_connect
    return cursor



def test_auth_gets_user_from_database(client, db_connect):
    db_connect.fetchone.return_value = (1, (common.hash_password("my_password")))

    client.post("/auth/login", json={"email": "test@test.com", "password": "my_password"})

    db_connect.execute.assert_called_once()
    assert db_connect.execute.call_args[0][1] == ("test@test.com",)


def test_auth_email_not_found(client, db_connect):
    db_connect.fetchone.return_value = None

    response = client.post("/auth/login", json={"email": "bad@email.com", "password": "my_password"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_auth_wrong_password(client, db_connect):
    db_connect.fetchone.return_value = (1, (common.hash_password("my_password")))

    response = client.post("/auth/login", json={"email": "test@test.com", "password": "wrongpassword"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_auth_correct_password_creates_token(client, db_connect):
    db_connect.fetchone.return_value = (2, (common.hash_password("my_password")))

    response = client.post("/auth/login", json={"email": "test@test.com", "password": "my_password"})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    credentials = common.HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=data["access_token"]
    )
    user_id = common.get_current_user(credentials)
    assert user_id == 2
    assert user_id != 1


def test_database_closes_after_successful_login(client, db_connect):
    db_connect.fetchone.return_value = (1, (common.hash_password("my_password")))

    client.post("/auth/login", json={"email": "test@test.com", "password": "my_password"})

    conn = db_connect.mock_connect.return_value
    conn.close.assert_called_once()