from django.conf import settings


def validate_sensor_values(data):
    """
    Validates sensor values against configured ranges.
    Returns dict of field-level errors, empty if all valid.
    """
    errors = {}
    ranges = settings.SENSOR_RANGES

    # Temperature validation
    temp = data.get('temperature')
    if temp is not None:
        if not (ranges['temperature']['min'] <= temp <= ranges['temperature']['max']):
            errors['temperature'] = (
                f"Temperature {temp}°C outside valid range "
                f"{ranges['temperature']['min']}-{ranges['temperature']['max']}°C"
            )

    # Pressure validation
    pressure = data.get('pressure')
    if pressure is not None:
        if not (ranges['pressure']['min'] <= pressure <= ranges['pressure']['max']):
            errors['pressure'] = (
                f"Pressure {pressure} bar outside valid range "
                f"{ranges['pressure']['min']}-{ranges['pressure']['max']} bar"
            )

    # Vibration validation
    vibration = data.get('vibration')
    if vibration is not None:
        if not (ranges['vibration']['min'] <= vibration <= ranges['vibration']['max']):
            errors['vibration'] = (
                f"Vibration {vibration} mm/s outside valid range "
                f"{ranges['vibration']['min']}-{ranges['vibration']['max']} mm/s"
            )

    # Flow rate validation
    flow_rate = data.get('flow_rate')
    if flow_rate is not None:
        if not (ranges['flow_rate']['min'] <= flow_rate <= ranges['flow_rate']['max']):
            errors['flow_rate'] = (
                f"Flow rate {flow_rate} L/min outside valid range "
                f"{ranges['flow_rate']['min']}-{ranges['flow_rate']['max']} L/min"
            )

    # Humidity validation
    humidity = data.get('humidity')
    if humidity is not None:
        if not (ranges['humidity']['min'] <= humidity <= ranges['humidity']['max']):
            errors['humidity'] = (
                f"Humidity {humidity}% outside valid range "
                f"{ranges['humidity']['min']}-{ranges['humidity']['max']}%"
            )

    return errors
