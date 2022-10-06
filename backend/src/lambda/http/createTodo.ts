import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { create } from '../../layers/business/todos'

import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item - DONE
   
    const todoItem = await create(newTodo,event);

    const logger = createLogger('createTodo Handler')
    logger.info('TODO created', {
      // Additional information stored with a log statement
    item: JSON.stringify(todoItem)
    })
  

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todoItem
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
