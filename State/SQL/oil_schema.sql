CREATE TABLE state(
	Abber	VARCHAR,
	State  VARCHAR(30), 
	Latitude FLOAT NOT NULL,
	Longitude FLOAT,
	PRIMARY KEY (State)
);

CREATE TABLE prod_con_pop(
	State  VARCHAR(30), 
	year INT NOT NULL,
	Consumption INT, 
	Production INT,
	Population INT,
	FOREIGN KEY (State) REFERENCES state(State)
);

CREATE VIEW oil AS 
SELECT s.Abber, s.State, 
s.Latitude, s.Longitude, p.year, p.Population, 
p.Production, p.Consumption
FROM state s
JOIN prod_con_pop p
ON  s.State =  p.State
SELECT *
FROM oil;
