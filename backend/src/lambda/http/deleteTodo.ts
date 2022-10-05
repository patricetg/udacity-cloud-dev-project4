import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { remove } from '../../layers/business/todos'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id - DONE
    await remove(todoId);

    const logger = createLogger('deleteTodo Handler')
    logger.info('TODO deleted', {
      // Additional information stored with a log statement
    item: JSON.stringify(todoId)
    })
    
    return {
      statusCode: 202,
      body: JSON.stringify({})
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
