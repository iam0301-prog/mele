from python_api.models import AstroRequest, HumanDesignRequest


def test_astro_accepts_birth_timezone_with_daylight_saving_time():
    request = AstroRequest.model_validate(
        {
            "birth_date": "1990-07-01",
            "birth_time": "12:00",
            "birth_timezone": "America/Los_Angeles",
            "latitude": 34.0522,
            "longitude": -118.2437,
        }
    )

    assert request.timezone == -7.0


def test_human_design_accepts_iana_timezone_string():
    request = HumanDesignRequest.model_validate(
        {
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "timezone": "America/Los_Angeles",
        }
    )

    assert request.timezone == -8.0
