import postgresql
import os
import json

db = postgresql.open('pq://postgres:Proline185@localhost:5432/Reddit')
chains_dir = os.getcwd() + "/../chains/"

insert_sub = db.prepare("INSERT INTO subreddit(name) VALUES ($1) RETURNING id")
insert_node = db.prepare("INSERT INTO node(subreddit_id, state, next) VALUES ($1, $2, $3)")

for filename in os.listdir(chains_dir):
	subname = os.path.splitext(os.path.basename(filename))[0]
	sub_id = insert_sub(subname)[0][0]
	print(sub_id)
	with open(chains_dir + filename) as jsonfile:
		chain = json.load(jsonfile)
		with db.xact():
			for node in chain:
				insert_node(sub_id, node[0], json.dumps(node[1]))