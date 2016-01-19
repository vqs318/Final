import json
import os
import glob

chains_dir = os.getcwd() + "/../chains/"

for filename in glob.glob(chains_dir + '*.json'):
	print('Converting ' + filename + "...", end="")

	with open(filename) as jsonfile:
		with open(os.path.splitext(filename)[0] + '.csv', 'w') as csvfile:
			csvfile.write('state\tnext\n')
			as_json = json.load(jsonfile)
			for node in as_json:
				state = ('{' + json.dumps(node[0][0]) + ', ' + json.dumps(node[0][1]) + '}').replace('`', "'")
				next = (json.dumps(node[1]) + "\n").replace('`', "'")
				csvfile.write(state + "\t" + next)

	print('Done.')