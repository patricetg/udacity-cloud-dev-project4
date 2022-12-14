import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

//import { updateTodo } from '../../business/layers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { modify } from '../../layers/business/todos'
import { createLogger } from '../../utils/logger'
//import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object - DONE
    const newTodo = modify(event,todoId,updatedTodo);

    const logger = createLogger('updateTodos handler')
    logger.info('TODO updated', {
      // Additional information stored with a log statement
    item: JSON.stringify(newTodo)
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        newTodo
      })
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
