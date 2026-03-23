/* Create indexes */

CREATE INDEX idx_sensor_id_time
ON sensor_readings(sensor_id, created_at);

CREATE INDEX idx_sensor_time
ON sensor_readings(created_at);

/* Create combined index using tank_id and created_at columns in sensor_readings table  */

CREATE INDEX idx_sensor_tank_time
ON sensor_readings(tank_id,created_at);;
