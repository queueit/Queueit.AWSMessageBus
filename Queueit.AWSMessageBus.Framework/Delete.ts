﻿/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict"

import * as AWS from 'aws-sdk';
import * as Lambda from 'aws-lambda';

declare var exports: Lambda.Exports;

exports.handler = async (event: DeleteEvent, context: Lambda.Context, callback: Lambda.Callback) => {
    var request = new DeleteRequest(event);

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

class DeleteEvent implements Lambda.IEvent {
    public receiptHandle: string;
    public subscriberId: string;
}

class DeleteRequest {
    private subscriberId: string;
    private receiptHandle: string;

    constructor(event: DeleteEvent) {
        this.subscriberId = event.subscriberId;
        this.receiptHandle = event.receiptHandle;
    }

    public async execute(callback: Lambda.Callback) {
        var sqsClient = new AWS.SQS();

        var queueUrl = "https://sqs.eu-west-1.amazonaws.com/170643467817/MessageBus_" + this.subscriberId;

        console.log("Queue Url: " + queueUrl);
        console.log("Receipt Handle: " + this.receiptHandle);

        await this.executeAwsRequestAsync((callback) =>
            sqsClient.deleteMessage(
                {
                    QueueUrl: queueUrl,
                    ReceiptHandle: this.receiptHandle
                },
                callback));
    }

    private executeAwsRequestAsync(request: (callback: (err, data) => void) => void) {
        console.log("start request ");

        return new Promise(
            (resolve, reject) => request((err, data) => {
                if (!err) {
                    console.log("success " + err);
                } else {
                    console.log("error: " + err);

                    reject(err);
                }
            }));
    }
}