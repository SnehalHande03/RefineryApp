-- Create database
CREATE DATABASE refinery_db;

-- Create or reset user
DROP USER IF EXISTS postgres;
CREATE USER postgres WITH PASSWORD 'snehal';

-- Grant privileges
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed'; 
ALTER ROLE postgres SET default_transaction_deferrable TO on;
ALTER ROLE postgres SET default_time_zone TO 'UTC';

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE refinery_db TO postgres;

-- Connect to database and grant schema privileges
\c refinery_db
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

SELECT 'PostgreSQL setup complete!' as status;
