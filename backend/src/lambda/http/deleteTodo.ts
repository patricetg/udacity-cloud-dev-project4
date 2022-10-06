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

    await remove(todoId,event);

    const logger = createLogger('deleteTodo Handler')
    logger.info('TODO deleted', {
      // Additional information stored with a log statement
    item: JSON.stringify(todoId)
    })
    
    return {
      statusCode: 202,
      /* headers: { //middy cors is not working; since I was unable to locate why and resolve it, I fix the issue this way
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
        
      }, */
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

