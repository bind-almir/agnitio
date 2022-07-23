const { errorResponse, buildResponse } = require("./utils")
const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition');

const handler = async (event) => {
  try {
    const { fileName } = JSON.parse(event.body);
    if(!fileName) throw {
      statusCode: 400,
      message: "fileName is required"
    }

    const client = new RekognitionClient();
    const command = new DetectFacesCommand({
      Image: {
        S3Object: {
          Bucket: process.env.UPLOAD_BUCKET_NAME, 
          Name: fileName
        }
      },
      Attributes: ["ALL"]
    });
    
    const response = await client.send(command);
    return buildResponse(200, response);
  } catch (error) {
    return errorResponse(error);
  } 
}

module.exports = {
  handler
}
