set schema 'countries';
SELECT country, ROUND(AVG(oil_prod),2)
FROM oil_production
WHERE (code = 'USA') AND (year = 2019)
GROUP BY country
ORDER BY oil_prod DESC

--Top 10 countries by Oil, NGPL and other liquids Production in 2019
SELECT o.country, round(AVG(o.oil_prod),2) AS avg_oil
FROM countries AS c
INNER JOIN oil_production as o
ON c.country_code = o.code
INNER JOIN petrol_production as p
ON c.country_code = p.code
WHERE o.year = 2019
GROUP BY o.country
ORDER BY avg_oil DESC
LIMIT 10;

--Top 10 countries by Petroleum Production in 2019
SELECT o.country, round(AVG(p.petrol_prod),2) AS avg_petrol,
FROM countries AS c
INNER JOIN oil_production as o
ON c.country_code = o.code
INNER JOIN petrol_production as p
ON c.country_code = p.code
WHERE o.year = 2019
GROUP BY o.country
ORDER BY avg_oil DESC
LIMIT 10;
