/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict";

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: SubscribeEvent, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new SubscribeRequest(event);

    console.log("start");

    try {

        await request.execute(callback);

        callback(null, "success");
    } catch (e) {
        console.log("Exception: " + e);

        callback(e, "failed");
    } 

    console.log("end");
}

class SubscribeEvent implements Lambda.IEvent {
    public subscriberId: string;
    public messageType: string;
}

class SubscribeRequest {
    private messageType: string;
    private subscriberId: string;

    constructor(event: SubscribeEvent) {
        this.messageType = event.messageType;
        this.subscriberId = event.subscriberId;
    }

    public async execute(callback: Lambda.Callback) {
        var snsClient = new AWS.SNS();
        var sqsClient = new AWS.SQS();

        var queueName = "MessageBus_" + this.subscriberId;
        var topicName = "MessageBus_" + this.messageType;

        console.log("Queue name: " + queueName);
        console.log("Topic name: " + topicName);

        var createQueueResponse = await this.executeAwsRequestAsync<AWS.SQS.CreateQueueResult>((callback) =>
            sqsClient.createQueue(
                {
                    QueueName: queueName,
                    Attributes: {
                        Policy: '{"Version": "2012-10-17","Id": "SNSSenMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
                } },
                callback));
        var queueAttributesResponse = await this.executeAwsRequestAsync<AWS.SQS.GetQueueAttributesResult>((callback) => {
            sqsClient.getQueueAttributes(
                {
                    QueueUrl: createQueueResponse.QueueUrl,
                    AttributeNames: ["All"]
                },
                callback);
            });

        var queueArn = queueAttributesResponse.Attributes["QueueArn"];

        console.log("SQS queue created: " + createQueueResponse.QueueUrl + ":" + queueArn);

        var createTopicResponse = await this.executeAwsRequestAsync<AWS.SNS.CreateTopicResult>((callback) =>
            snsClient.createTopic(
                { Name: topicName },
                callback));

        console.log("SNS topoc created: " + createTopicResponse.TopicArn);

        var subscribeResponse = await this.executeAwsRequestAsync<AWS.SNS.SubscribeResult>((callback) =>
            snsClient.subscribe(
            {
                TopicArn: createTopicResponse.TopicArn,
                Protocol: "sqs",
                Endpoint: queueArn
            },
            callback));

        console.log("SQS queue subscribed to topic: " + subscribeResponse.SubscriptionArn);
    }

    private executeAwsRequestAsync<TResponse>(request: (callback: (err, data) => void) => void) {
        console.log("start request ");

        return new Promise<TResponse>(
            (resolve, reject) => request((err, data) => {
                if (!err) {
                    console.log("success " + err);
                    resolve(data);
                } else {
                    console.log("error: " + err);

                    reject(err);
                }
            }));
    }
}