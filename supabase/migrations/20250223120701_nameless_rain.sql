/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - username (text, unique) - TC Kimlik No
      - name (text)
      - role (text)
      - department (text)
      - is_approved (boolean)
      - email (text)
      - phone (text)
      - station (text)
      - station_type (text)
      - created_at (timestamptz)

    - complaints
      - id (uuid, primary key)
      - title (text)
      - license_plate (text)
      - gps_location (text)
      - camera_status (text)
      - vehicle_status (text)
      - is_resolved (boolean)
      - police_station (text)
      - engine_running (boolean)
      - auto_parking (boolean)
      - created_at (timestamptz)
      - resolved_at (timestamptz)
      - user_id (uuid, foreign key)

    - plate_info
      - id (uuid, primary key)
      - plate (text, unique)
      - owner (text)
      - vehicle (text)
      - color (text)
      - phone (text)
      - email (text)
      - tc_no (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for each table
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  is_approved boolean DEFAULT false,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  station text,
  station_type text,
  created_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  license_plate text NOT NULL,
  gps_location text,
  camera_status text,
  vehicle_status text,
  is_resolved boolean DEFAULT false,
  police_station text,
  engine_running boolean DEFAULT false,
  auto_parking boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE
);

-- Plate info table
CREATE TABLE IF NOT EXISTS plate_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text UNIQUE NOT NULL,
  owner text NOT NULL,
  vehicle text NOT NULL,
  color text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  tc_no text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE plate_info ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins and chiefs can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'POLICE_CHIEF', 'GENDARMERIE_COMMANDER')
    )
  );

CREATE POLICY "Anyone can create user"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Complaints policies
CREATE POLICY "Anyone can read complaints"
  ON complaints
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create complaints"
  ON complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Officers can update complaints"
  ON complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'POLICE_CHIEF', 'POLICE_OFFICER', 'GENDARMERIE_COMMANDER', 'GENDARMERIE')
    )
  );

-- Plate info policies
CREATE POLICY "Officers can read plate info"
  ON plate_info
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'POLICE_CHIEF', 'POLICE_OFFICER', 'GENDARMERIE_COMMANDER', 'GENDARMERIE')
    )
  );

CREATE POLICY "Officers can insert plate info"
  ON plate_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'POLICE_CHIEF', 'POLICE_OFFICER', 'GENDARMERIE_COMMANDER', 'GENDARMERIE')
    )
  );

CREATE POLICY "Officers can update plate info"
  ON plate_info
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'POLICE_CHIEF', 'POLICE_OFFICER', 'GENDARMERIE_COMMANDER', 'GENDARMERIE')
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plate_info_updated_at
  BEFORE UPDATE ON plate_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();