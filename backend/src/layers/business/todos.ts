import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'

import {TodoItem} from "../../models/TodoItem"
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../../auth/utils'
import { TodosAccess } from '../data/todosAccess'


const todosAccess= new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function create(createTodoRequest: CreateTodoRequest,event: APIGatewayProxyEvent): Promise<TodoItem> {
  
    console.log('Processing event: ', event)

    const itemId = uuid.v4()
    const userId = getUserId(event)

    const createdAt = new Date(Date.now()).toISOString();

    return await todosAccess.create({
        todoId: itemId,
        userId: userId,
        createdAt: createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
        ...createTodoRequest
    })
}
