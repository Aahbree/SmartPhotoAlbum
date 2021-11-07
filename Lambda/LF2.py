import json
import boto3
import os
import sys
import subprocess
os.system('pip3 install requests -t /tmp/ --no-cache-dir')
sys.path.insert(1, '/tmp/')
os.system('pip3 install requests_aws4auth -t /tmp/ --no-cache-dir')
sys.path.insert(1, '/tmp/')
import requests
from requests_aws4auth import AWS4Auth

def clearIndices():
    host = 'https://search-ccphotos-khsgzfyvsqyj4zske6iodihtd4.us-east-1.es.amazonaws.com/ccphotos/'
    res = requests.delete(host)
    res = json.loads(res.content.decode('utf-8'))
    return res   

def searchIndices():
    host = 'https://search-ccphotos-khsgzfyvsqyj4zske6iodihtd4.us-east-1.es.amazonaws.com/ccphotos/_search?q=dog'
    res = requests.get(host)
    res = json.loads(res.content.decode('utf-8'))
    return res

def searchElasticIndex(search):
    photos = []
    for s in search:
        host = 'https://search-ccphotos-khsgzfyvsqyj4zske6iodihtd4.us-east-1.es.amazonaws.com/ccphotos/_search?q='+s
        service = 'es'
        region = 'us-east-1'
        headers = { "Content-Type": "application/json" }
        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
        res = requests.get(host, auth=awsauth, headers=headers)
        res = json.loads(res.content.decode('utf-8'))
        for item in res["hits"]["hits"]:
            bucket = item["_source"]["bucket"]
            key = item["_source"]["objectKey"]
            photoURL = "https://{0}.s3.amazonaws.com/{1}".format(bucket,key)
            photos.append(photoURL)
        print("---------------Open Search photos------------------")
        print(photos)
    return photos

def prepareForSearch(res):
    photos = []
    if res["slots"]["slotOne"] != None:
        photos.append(res["slots"]["slotOne"])
    if res["slots"]["slotTwo"] != None:
        photos.append(res["slots"]["slotTwo"])
    return photos

def sendToLex(message):
    lex = boto3.client('lex-runtime')
    response = lex.post_text(
        botName='lexsearchphotos',
        botAlias='photos',
        userId='lf1',
        inputText=message)
    return response
    
def lambda_handler(event, context):
    # TODO implement
    photos = []
    #res = clearIndices() used to clear indexes in ES
    #res = searchIndices() #used to check index
    print("--------------------------search event------------------------")
    print(event)
    message = event["queryStringParameters"]["q"]
    print("______________sending to lex_________________")
    resFromLex = sendToLex(message)
    print("-----------------lex_response-----------------")
    print(resFromLex)
    search = prepareForSearch(resFromLex)
    Photo = searchElasticIndex(search)
    return {
        'statusCode': 200,
        'body': json.dumps(Photo),
        'headers':{ 'Access-Control-Allow-Origin' : '*' }
    }