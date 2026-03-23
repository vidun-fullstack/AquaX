/* To retrive analytics data by the database */

/* Query for average daily water quality details */

SELECT
DATE(created_at) AS date,
AVG(ph) AS avg_ph,
AVG(temp) AS avg_temp,
AVG(turbidity) AS avg_turbidity
FROM sensor_readings
WHERE sensor_id = 1
GROUP BY DATE(created_at)
ORDER BY date DESC;

/* Query for average weekly water quality details */

SELECT
DATE_TRUNC('week',created_at) AS week,
AVG(ph) AS avg_ph,
AVG(temp) AS avg_temp,
AVG(turbidity) AS avg_turbidity
FROM sensor_readings
WHERE tank_id='TANK_ID'
GROUP BY week
ORDER BY week DESC;

/* Return newest sensor readings at the moment */

SELECT * FROM sensor_readings
WHERE tank_id='TANK_ID'
ORDER BY created_at DESC
LIMIT 1;

