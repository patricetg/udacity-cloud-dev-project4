import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
//import { getUserId } from '../utils';
import { getTodos } from '../../layers/business/todos'
import { createLogger } from '../../utils/logger'

// TODO: Get all TODO items for a current user - DONE
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todos = await getTodos(event);

    const logger = createLogger('getTodos handler')
    logger.info('TODOs retrieved', {
      // Additional information stored with a log statement
    item: JSON.stringify(todos)
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
});

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)

/* handler.use(
  cors({
    credentials: true
  })
) */
