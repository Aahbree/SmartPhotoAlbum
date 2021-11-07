import json
import boto3
#from botocore.vendored import requests
#from requests_aws4auth import AWS4Auth
from datetime import datetime
import os
import sys
import subprocess
os.system('pip3 install requests -t /tmp/ --no-cache-dir')
sys.path.insert(1, '/tmp/')
os.system('pip3 install requests_aws4auth -t /tmp/ --no-cache-dir')
sys.path.insert(1, '/tmp/')
import requests
from requests_aws4auth import AWS4Auth
#from opensearchpy import OpenSearch, RequestsHttpConnection


def indexIntoES(document):
    host = 'https://search-ccphotos-khsgzfyvsqyj4zske6iodihtd4.us-east-1.es.amazonaws.com'
    index = 'ccphotos'
    type = 'lambda-type'
    url = host + '/' + index + '/' + type
    service = 'es'
    region = 'us-east-1'
    headers = { "Content-Type": "application/json" }
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
    r = requests.post(url, auth=awsauth, json=document, headers=headers)
    return r
 
def parseForElasticSearch(bucket,name,res, user_labels):
    labels = user_labels
    for rec in res['Labels']:
        labels.append(rec['Name'])
    print("----------labels-------------")
    print(labels)
    document = {
        "objectKey" : name,
        "bucket" : bucket,
        "createdTimeStamp" : datetime.now().strftime("%y-%m-%d %H:%M:%S"), #"2020-05-02 17:32:55",
        "labels" : labels
        
    }
    return document
        

def detectRekognitionLabel(bucket,name):
    rek = boto3.client('rekognition')
    response = rek.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': name
            }
        },
        MinConfidence = 95
    )
    return response

def lambda_handler(event, context):
    # TODO implement
    print(event["Records"][0])
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    name = event["Records"][0]["s3"]["object"]["key"]
    res = detectRekognitionLabel(bucket,name)
    print("________________Recognition__________________")
    print(res)
    print("---------MetaData---------")
    s3 = boto3.client('s3')
    resMeta = s3.head_object(Bucket=bucket, Key=name)
    print(resMeta)
    userLabels= resMeta['ResponseMetadata']['HTTPHeaders']['x-amz-meta-customlabels'];
    user_labels = [x.strip() for x in userLabels.split(',')]
    print(user_labels)
    document = parseForElasticSearch(bucket,name,res,user_labels)
    response = indexIntoES(document)
    data = json.loads(response.content.decode('utf-8'))
    
    return {
        'statusCode': 200,
        'body': json.dumps("hi")
    }