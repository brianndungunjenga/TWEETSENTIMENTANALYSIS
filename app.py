from flask import Flask, render_template, request, jsonify
import json
import tweepy as tw
import os
from googletrans import Translator
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import emoji
import numpy as np
import re

analyzer = SentimentIntensityAnalyzer()
translator = Translator()

# twitter authentication
auth = tw.OAuthHandler(os.environ['TWITTER_CONSUMER_KEY'], os.environ['TWITTER_CONSUMER_SECRET'])
auth.set_access_token(os.environ["TWITTER_ACCESS_TOKEN"], os.environ["TWITTER_ACCESS_TOKEN_SECRET"])

api = tw.API(auth, wait_on_rate_limit=True)

app = Flask(__name__)

# Clean Tweets
def remove_pattern(input_txt, pattern):
    r = re.findall(pattern, input_txt)
    for i in r:
        input_txt = re.sub(i, '', input_txt)
    return input_txt
def clean_tweets(lst):
    # remove twitter Return handles (RT @xxx:)
    lst = np.vectorize(remove_pattern)(lst, "RT @[\w]*:")
    # remove twitter handles (@xxx)
    lst = np.vectorize(remove_pattern)(lst, "@[\w]*")
    # remove URL links (httpxxx)
    lst = np.vectorize(remove_pattern)(lst, "https?://[A-Za-z0-9./]*")
    # remove emojis
    lst = np.vectorize(remove_pattern)(lst, "")
    # remove special characters, numbers, punctuations (except for #)
    lst = np.core.defchararray.replace(lst, "[^a-zA-Z#]", " ")
    return lst

# Translate Tweets
def translate(text, engl=True):
    if engl:
        trans = text
        return trans
    else:
        trans = translator.translate(text).text
        return trans

@app.route('/')
def func():
    return render_template('index.html')

@app.route('/upload', methods=["GET", "POST"])
def upload_data():
    if request.method == 'POST':
        search = request.form
        print(search)
        #hashtagtweet = tw.Cursor(api.search, q="kobe", count=500, since="2020-01-26")
        query = search.to_dict()['search'] 
        date = search.to_dict()['Date']
        totaltweets = search.to_dict()['Totaltweets']
        type(totaltweets)
        hashtagtweet = tw.Cursor(api.search, q=query, since=date).items(int(totaltweets))
        values = []
        tweetvalues = []
        tweetpolarityvalues = []
        
        for tag in hashtagtweet:
            strippedtext = emoji.demojize(tag.text)
            clntweets = clean_tweets(strippedtext).tolist();

            try:
                tweettext = translator.translate(clntweets).text
                tweetvalues.append(tweettext)
                tweetpolarity = analyzer.polarity_scores(tweettext)
                tweetpolaritycompound = tweetpolarity['compound']
                
                tweetpolarityvalues.append(tweetpolaritycompound)
            except json.decoder.JSONDecodeError:
                print('Cannot Translate Tweet')
            print(tweetvalues)
            values.append(tag.text)

        # return jsonify(values)
        print(tweetpolaritycompound)
        return jsonify(values, tweetpolarityvalues)

if __name__ == '__main__':
    app.run(debug=True)
