DROP VIEW geoconflict;
CREATE TABLE geolocation(
	name  VARCHAR, 
	latitude FLOAT,
	longitude FLOAT,
	country CHAR(5), 
	PRIMARY KEY (name)				
);
CREATE TABLE conflict(
	conflict_id	INT NOT NULL,
	year  INT, 
	location VARCHAR,
	side_a VARCHAR,
	side_b VARCHAR ,
	intensity_level VARCHAR,
	start_date	DATE, 
	ep_end CHAR,
	FOREIGN KEY (location) REFERENCES geolocation(name)
);
CREATE VIEW geoconflict AS 
SELECT c.conflict_id, g.country, c.location, g.Latitude, g.Longitude,  
c.year, c.side_a, c.side_b, 
c.intensity_level, c.start_date, c.ep_end
FROM geolocation g
JOIN conflict c
ON  c.location = g.name
ORDER BY year Asc;
SELECT *
FROM geoconflict;
