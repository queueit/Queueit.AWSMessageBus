/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: ReceiveEvent, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new ReceiveRequest(event);

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

class ReceiveEvent implements Lambda.IEvent {
    public subscriberId: string;
}

class ReceiveRequest {
    private subscriberId: string;

    constructor(event: ReceiveEvent) {
        this.subscriberId = event.subscriberId;
    }

    public async execute(callback: Lambda.Callback) {
        var sqsClient = new AWS.SQS();

        var queueUrl = "https://sqs.eu-west-1.amazonaws.com/170643467817/MessageBus_" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);

        var receiveMessageResponse = await this.executeAwsRequestAsync<AWS.SQS.ReceiveMessageResult>((callback) =>
            sqsClient.receiveMessage(
                {
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 1,
                    VisibilityTimeout: 10
                },
                callback));

        if (receiveMessageResponse.Messages) {
            receiveMessageResponse.Messages.forEach((value, indexed) => {
                var body = JSON.parse(value.Body);
                var result = {
                    receiptHandle: value.ReceiptHandle,
                    message: body.Message
                };
                console.log(result);
                callback(null, JSON.stringify(result));
            });
        } else {
            console.log("No messages");
            callback(null, null);
        }
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