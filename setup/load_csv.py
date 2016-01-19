import postgresql
import os
import json
import glob
from subprocess import Popen, PIPE, STDOUT

chains_dir = os.getcwd() + "/../chains/"
db = postgresql.open('pq://postgres:Proline185@localhost:5432/redditmarkov')

for filename in glob.glob(chains_dir + '*.csv'):
	subname = os.path.splitext(os.path.basename(filename))[0]

	print('Loading ' + subname + '...', end="")
	sql = '''

		CREATE TEMP TABLE temp_nodes(
			state text[],
			next json
		); 

		\\copy temp_nodes FROM '{filename}'(FORMAT csv, HEADER true, DELIMITER '\t', QUOTE '`');

		BEGIN;

		INSERT INTO node(state, subreddit_id)
		SELECT state, subreddit.id
		FROM temp_nodes
		JOIN subreddit ON subreddit.name = '{subname}';

		INSERT INTO edge(from_node_id, to_node_id, subreddit_id, weight)
		SELECT fro.id, too.id, subreddit.id, next_data.value::int
		FROM temp_nodes
		JOIN subreddit ON subreddit.name = '{subname}'
		LEFT JOIN LATERAL json_each_text(temp_nodes.next) next_data ON TRUE
		JOIN node fro ON fro.state[1] = temp_nodes.state[1] AND fro.state[2] = temp_nodes.state[2] AND fro.subreddit_id = subreddit.id
		JOIN node too ON too.state[1] = temp_nodes.state[2] AND too.state[2] = next_data.key  AND too.subreddit_id = subreddit.id
		;

		COMMIT;
	'''.format(**locals())
	p = Popen(['psql', '-U', 'postgres', 'redditmarkov'], stdout=PIPE, stdin=PIPE, stderr=STDOUT)    
	stdout = p.communicate(input=bytes(sql, 'UTF-8'))
	print(stdout[0].decode())
	print('Done.')
	# print(sql)
	# db.execute(sql)
