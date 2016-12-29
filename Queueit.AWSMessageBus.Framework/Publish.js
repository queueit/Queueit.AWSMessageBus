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
    var request = new PublishRequest(event);
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
class PublishEvent {
}
class PublishRequest {
    constructor(event) {
        this.message = event.message;
        this.messageType = event.messageType;
    }
    execute(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var snsClient = new AWS.SNS();
            var topicArn = "arn:aws:sns:eu-west-1:170643467817:MessageBus_" + this.messageType;
            console.log("Topic Arn: " + topicArn);
            var publishResponse = yield this.executeAwsRequestAsync((callback) => snsClient.publish({ TopicArn: topicArn, Message: this.message }, callback));
            console.log("Published: " + publishResponse.MessageId);
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
//# sourceMappingURL=Publish.js.map