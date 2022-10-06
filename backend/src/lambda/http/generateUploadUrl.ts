import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../layers/business/todos'
//import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id - DONE
    const url = await createAttachmentPresignedUrl(todoId);
    console.log("url : "+ url);

    const logger = createLogger('signed url generated Handler')
    logger.info('URL generated', {
      // Additional information stored with a log statement
    item: JSON.stringify(todoId)
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
