import markovify
import sqlite3
import nltk
import sys

NUMBER_COMMENTS = 10000
NUMBER_SUBREDDITS = 100

nltk.download('punkt')
conn = sqlite3.connect('database.sqlite')

#Iterate over each subreddit
for top_subreddit in conn.execute("SELECT subreddit FROM May2015 GROUP BY subreddit ORDER BY COUNT(*) DESC LIMIT ?;", [NUMBER_SUBREDDITS]):
	subreddit = top_subreddit[0]
	print("Processing {}...".format(subreddit), end="")
	with open("../chains/{}.json".format(subreddit), "w") as outfile:
		comments = [
			[word.lower() for word in nltk.word_tokenize(comment[0])] 
			for comment in conn.execute('SELECT body FROM May2015 WHERE subreddit = ? LIMIT ?', (subreddit, NUMBER_COMMENTS))
		]
		chain = markovify.Chain(comments, 2)
		outfile.write(chain.to_json())
	print("Done.")