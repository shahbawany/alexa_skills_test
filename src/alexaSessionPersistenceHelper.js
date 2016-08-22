// Author: Shah Bawany
// Date: 2016-08-21


DYNAMO_CONFIG = {
  tableName: "RecipeUserStatev2",
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
};


// updates session.attributes with session from Dynamo DB and then callback with session passed in
exports.getSessionFromDynamo = function(dynamoConfig, key, session, callback) {
  console.log("=> getSessionFromDynamo(tableName=" + dynamoConfig.tableName + ",key=" + key + ",session=" + JSON.stringify(session) + ")");
  // callback function takes a single argument for the session to retrieve
  if (session.attributes && Object.keys(session.attributes).length > 0) {
      // invoke callback if session attributes exists
      console.log("<= getSessionFromDynamo did not attempt to modify session");
      callback(session);
  } else {
    // get session from dynamo
    var AWS = require("aws-sdk");
    AWS.config.update({
      region: dynamoConfig.region, 
      endpoint: dynamoConfig.endpoint
    })
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: dynamoConfig.tableName,
      Key: key
    };
    docClient.get(params, function(err, data) {
      if (err) {
        console.log(err);
        // session is empty
        console.log("<= getSessionFromDynamo failed to fetch session from Dynamo");
        callback(session);
      } else {
        // overwrite session with data
        session.attributes = data.Item
        console.log("<= getSessionFromDynamo updated session attributes to " + JSON.stringify(session.attributes));
        callback(session);
      } 
    });
  }
}

// persists session to Dynamo DB and then callback with no arguments
exports.putSessionInDynamo = function(dynamoConfig, session, callback) {
  // callback function takes a single argument for the session to retriev
  if (session) {
    // put session in dynamo
    var AWS = require("aws-sdk");

    AWS.config.update({
      region: dynamoConfig.region, 
      endpoint: dynamoConfig.endpoint
    })
    var docClient = new AWS.DynamoDB.DocumentClient();
    sessionAttributes = session.attributes
    sessionAttributes["userId"] = session.user.userId
    console.log("=> putSessionInDynamo(tableName=" + dynamoConfig.tableName + ",session=" + JSON.stringify(sessionAttributes) + ")");
    var params = {
      TableName: dynamoConfig.tableName,
      Item: sessionAttributes
    };
    docClient.put(params, function(err, data) {
      if (err) {
        console.log("<= putSessionInDynamo failed to write to Dynamo: " + String(err));
        callback();
      } else {
        console.log("<= putSessionInDynamo successfully wrote session to Dynamo");
        callback();
      }
    });
  } else {
    callback()
  }
}
