import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import {TodoItem} from "../../models/TodoItem"
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../../auth/utils'
import { TodosAccess } from '../data/todosAccess'


const todosAccess= new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

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


export async function remove(todoId){
    
    await todosAccess.remove(todoId)
}

export async function createAttachmentPresignedUrl(todoId:string): Promise<string> {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
      });
}