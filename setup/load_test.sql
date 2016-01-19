	CREATE TABLE temp_nodes(
		state text[],
		next json
	); 

	\copy temp_nodes FROM '/home/miguel/Programming/IDE-Final/chains/1547Conspiration.csv'(FORMAT csv, HEADER true, DELIMITER '	', QUOTE '`');

	INSERT INTO node(state, subreddit_id)
	SELECT state, subreddit.id
	FROM temp_nodes
	JOIN subreddit ON subreddit.name = '1547Conspiration';