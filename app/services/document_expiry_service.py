from datetime import date


def get_document_status(
    expiry_date: date | None,
    reminder_days_before: int
):

    if expiry_date is None:
        return "NO_EXPIRY_DATE"

    today = date.today()

    if expiry_date < today:
        return "EXPIRED"

    days_remaining = (expiry_date - today).days

    if days_remaining <= reminder_days_before:
        return "EXPIRING_SOON"

    return "VALID"


if __name__ == "__main__":
    from datetime import date, timedelta

    print(
        get_document_status(
            date.today() - timedelta(days=1),
            10
        )
    )

    print(
        get_document_status(
            date.today() + timedelta(days=5),
            10
        )
    )

    print(
        get_document_status(
            date.today() + timedelta(days=30),
            10
        )
    )