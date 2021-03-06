/// <reference path="lib/dts/lambda.d.ts" />
/// <reference path="lib/dts/aws-sdk.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as AWS from 'aws-sdk';
exports.handler = (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
    var request = new ReceiveRequest(event);
    console.log("start");
    try {
        yield request.execute(callback);
        callback(null, "success");
    }
    catch (e) {
        console.log("Exception: " + e);
        callback(e, "failed");
    }
    console.log("end");
});
class ReceiveEvent {
}
class ReceiveRequest {
    constructor(event) {
        this.subscriberId = event.subscriberId;
    }
    execute(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var sqsClient = new AWS.SQS();
            var queueUrl = "https://sqs.eu-west-1.amazonaws.com/170643467817/MessageBus_" + this.subscriberId;
            console.log("Queue Url: " + queueUrl);
            var receiveMessageResponse = yield this.executeAwsRequestAsync((callback) => sqsClient.receiveMessage({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 1,
                VisibilityTimeout: 10
            }, callback));
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
            }
            else {
                console.log("No messages");
                callback(null, null);
            }
        });
    }
    executeAwsRequestAsync(request) {
        console.log("start request ");
        return new Promise((resolve, reject) => request((err, data) => {
            if (!err) {
                console.log("success " + err);
                resolve(data);
            }
            else {
                console.log("error: " + err);
                reject(err);
            }
        }));
    }
}
//# sourceMappingURL=Receive.js.map