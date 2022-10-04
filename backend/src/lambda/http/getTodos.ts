import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
//import { getUserId } from '../utils';
import { getTodos } from '../../layers/business/todos'

// TODO: Get all TODO items for a current user - DONE
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todos = await getTodos(event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
});

handler.use(
  cors({
    credentials: true
  })
)
