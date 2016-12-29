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
    var request = new SubscribeRequest(event);
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
class SubscribeEvent {
}
class SubscribeRequest {
    constructor(event) {
        this.messageType = event.messageType;
        this.subscriberId = event.subscriberId;
    }
    execute(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var snsClient = new AWS.SNS();
            var sqsClient = new AWS.SQS();
            var queueName = "MessageBus_" + this.subscriberId;
            var topicName = "MessageBus_" + this.messageType;
            console.log("Queue name: " + queueName);
            console.log("Topic name: " + topicName);
            var createQueueResponse = yield this.executeAwsRequestAsync((callback) => sqsClient.createQueue({
                QueueName: queueName,
                Attributes: {
                    Policy: '{"Version": "2012-10-17","Id": "SNSSenMessage","Statement": [{"Sid": "Allow-SNS-SendMessage","Effect": "Allow","Principal": "*","Action": ["sqs:SendMessage","SQS:ReceiveMessage","SQS:DeleteMessage"],"Resource": "arn:aws:*:*:*"}]}'
                } }, callback));
            var queueAttributesResponse = yield this.executeAwsRequestAsync((callback) => {
                sqsClient.getQueueAttributes({
                    QueueUrl: createQueueResponse.QueueUrl,
                    AttributeNames: ["All"]
                }, callback);
            });
            var queueArn = queueAttributesResponse.Attributes["QueueArn"];
            console.log("SQS queue created: " + createQueueResponse.QueueUrl + ":" + queueArn);
            var createTopicResponse = yield this.executeAwsRequestAsync((callback) => snsClient.createTopic({ Name: topicName }, callback));
            console.log("SNS topoc created: " + createTopicResponse.TopicArn);
            var subscribeResponse = yield this.executeAwsRequestAsync((callback) => snsClient.subscribe({
                TopicArn: createTopicResponse.TopicArn,
                Protocol: "sqs",
                Endpoint: queueArn
            }, callback));
            console.log("SQS queue subscribed to topic: " + subscribeResponse.SubscriptionArn);
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
//# sourceMappingURL=subscribe.js.map