/*Create sensor table*/

CREATE TABLE public.sensors (
  sensor_id smallint NOT NULL,
  sensor_name character varying NOT NULL,
  sensor_type character varying,
  tank_id uuid NOT NULL,
  status character varying NOT NULL,
  created_at timestamp without time zone NOT NULL,
  CONSTRAINT sensors_pkey PRIMARY KEY (sensor_id),
  CONSTRAINT sensors_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(tank_id)
);

/*Create sensor_readings table that will capture all readings */

CREATE TABLE public.sensor_readings(
  reading_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id INTEGER NOT NULL,
  temp real,
  ph real,
  turbidity real,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT sensor_readings_sensor_id_fkey
  FOREIGN KEY (sensor_id) REFERENCES public.sensors(sensor_id)
);
/* Creating alerts table*/

CREATE TABLE public.alerts(
  alert_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message TEXT NOT NULL,
  severity VARCHAR(50),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT false,
  tank_id uuid NOT NULL,
  sensor_id integer NOT NULL,
  CONSTRAINT alerts_tank_id_fkey
  FOREIGN KEY(tank_id) REFERENCES public.tanks(tank_id),
  CONSTRAINT alerts_sensor_id_fkey
  FOREIGN KEY (sensor_id) REFERENCES public.sensors(sensor_id)
);
/* Creating reports table */

CREATE TABLE public.reports(
  report_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  report_type VARCHAR(100) NOT NULL,
  avg_ph real,
  avg_temp real,
  avg_turbidity VARCHAR(50),
  craeted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  report_text text,
  tank_id uuid NOT NULL,
  CONSTRAINT reports_tank_id_fkey
  FOREIGN KEY (tank_id) REFERENCES public.tanks(tank_id)
);

CREATE TABLE public.ai_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  event_type text,
  confidence_score real,
  image_url text,
  tank_id uuid NOT NULL,
  CONSTRAINT ai_events_pkey PRIMARY KEY (id),
  CONSTRAINT ai_events_tank_id_fkey 
    FOREIGN KEY (tank_id) REFERENCES public.tanks(tank_id)
);

CREATE TABLE public.tanks (
  tank_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  tank_name character varying NOT NULL,
  tank_size character varying NOT NULL,
  created_at timestamp without time zone NOT NULL,
  CONSTRAINT tanks_pkey PRIMARY KEY (tank_id),
  CONSTRAINT tanks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.users (
  user_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  email character varying,
  password character varying,
  created_at timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

