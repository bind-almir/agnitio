/**
 * @param {number} statusCode - http status code
 * @param {object} body - response body
 * @param {object} contentType - response headers (optional). Default "Content-Type": "application/json"
 * @returns {object}  - A response object
 */

 const buildResponse = (statusCode, body, contentType) => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': contentType || 'application/json',
      'Access-Control-Allow-Origin': 'https://famous-fairy-e0b928.netlify.app',
      'Access-Control-Allow-Credentials': true, 
    },
  }
}

/**
 * @param {object} error - error object
 * @returns {object}  - A response object
 */

const errorResponse = (err) => {
  console.log(err);
  const { statusCode, message } = err;
  return buildResponse(
    statusCode || 500,
    { message } || { message: "server error" }
  );
}

module.exports = {
  buildResponse,
  errorResponse
};