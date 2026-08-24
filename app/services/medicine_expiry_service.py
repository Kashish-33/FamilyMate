from datetime import date


def get_medicine_status(
    expiry_date,
    reminder_days_before
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