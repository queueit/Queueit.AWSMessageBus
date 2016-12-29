/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: PublishEvent, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new PublishRequest(event);

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

class PublishEvent implements Lambda.IEvent {
    public messageType: string;
    public message: string;
}

class PublishRequest {
    private message: string;
    private messageType: string;

    constructor(event: PublishEvent) {
        this.message = event.message;
        this.messageType = event.messageType;
    }

    public async execute(callback: Lambda.Callback) {
        var snsClient = new AWS.SNS();

        var topicArn = "arn:aws:sns:eu-west-1:170643467817:MessageBus_" + this.messageType;

        console.log("Topic Arn: " + topicArn);

        var publishResponse = await this.executeAwsRequestAsync<AWS.SNS.PublishResult>((callback) =>
            snsClient.publish(
                { TopicArn: topicArn, Message: this.message },
                callback));

        console.log("Published: " + publishResponse.MessageId);
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