import postgresql
import os
import json
import glob

db = postgresql.open('pq://postgres:Proline185@localhost:5432/redditmarkov')
chains_dir = os.getcwd() + "/../_chains/"

insert_sub = db.prepare("INSERT INTO subreddit(name) VALUES ($1) RETURNING id")
#insert_node = db.prepare("INSERT INTO node(subreddit_id, state, next) VALUES ($1, $2, $3)")

for filename in glob.glob(chains_dir + '*.json'):
	subname = os.path.splitext(os.path.basename(filename))[0]
	sub_id = insert_sub(subname)
	# print(sub_id)
	# with open(chains_dir + filename) as jsonfile:
	# 	chain = json.load(jsonfile)
	# 	with db.xact():
	# 		for node in chain:
	# 			insert_node(sub_id, node[0], json.dumps(node[1]))

