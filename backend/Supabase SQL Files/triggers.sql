/* Creating function to catch risky pH values */

CREATE OR REPLACE FUNCTION check_ph_alert()
RETURNS TRIGGER AS $$
DECLARE
  tank_uuid uuid;
BEGIN
  -- Get tank_id from sensors table
  SELECT tank_id INTO tank_uuid
  FROM sensors
  WHERE sensor_id = NEW.sensor_id;

  IF NEW.ph > 8.5 THEN
    INSERT INTO alerts (message, severity, created_at, resolved, tank_id, sensor_id)
    VALUES (
      'PH level above safe range',
      'high',
      NOW(),
      false,
      tank_uuid,
      NEW.sensor_id
    );

  ELSIF NEW.ph < 6.5 THEN
    INSERT INTO alerts (message, severity, created_at, resolved, tank_id, sensor_id)
    VALUES (
      'PH level below safe range',
      'low',
      NOW(),
      false,
      tank_uuid,
      NEW.sensor_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* PH Trigger */
DROP TRIGGER IF EXISTS ph_alert_trigger ON sensor_readings;

CREATE TRIGGER ph_alert_trigger
AFTER INSERT ON sensor_readings
FOR EACH ROW
EXECUTE FUNCTION check_ph_alert();

/* Creating function catch risky temperature values */

CREATE OR REPLACE FUNCTION check_temperature_alert()
RETURNS TRIGGER AS $$
DECLARE
  tank_uuid uuid;
BEGIN
  SELECT tank_id INTO tank_uuid
  FROM sensors
  WHERE sensor_id = NEW.sensor_id;

  IF NEW.temp > 35 THEN
    INSERT INTO alerts (message, severity, created_at, resolved, tank_id, sensor_id)
    VALUES (
      'Temperature above safe range',
      'high',
      NOW(),
      false,
      tank_uuid,
      NEW.sensor_id
    );

  ELSIF NEW.temp < 20 THEN
    INSERT INTO alerts (message, severity, created_at, resolved, tank_id, sensor_id)
    VALUES (
      'Temperature below safe range',
      'low',
      NOW(),
      false,
      tank_uuid,
      NEW.sensor_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Temperature Trigger */

DROP TRIGGER IF EXISTS temperature_alert_trigger ON sensor_readings;

CREATE TRIGGER temperature_alert_trigger
AFTER INSERT ON sensor_readings
FOR EACH ROW
EXECUTE FUNCTION check_temperature_alert();
