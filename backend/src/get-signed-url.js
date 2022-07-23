const { errorResponse, buildResponse } = require("./utils")
const { randomUUID } = require('crypto');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const handler = async (event) => {
  try {
    const { ContentType } = event.queryStringParameters;
    const fileName = randomUUID();
    const client = new S3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.UPLOAD_BUCKET_NAME,
      Key: fileName,
      ContentType: decodeURIComponent(ContentType),
    });
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return buildResponse(200, { signedUrl, fileName });
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = {
  handler
}