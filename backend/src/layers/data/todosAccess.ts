import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import {TodoItem} from "../../models/TodoItem.ts"

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async create(item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
          TableName: this.todosTable,
          Item: item
        }).promise()
    
        return item;
    }

    async getTodos(): Promise<TodoItem[]> {
        console.log('Getting all todos')
    
        const result = await this.docClient.scan({
          TableName: this.todosTable
        }).promise()
    
        const items = result.Items
        return items as Group[]
    }

    async remove(todoId: string, userId:string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }

    async modify(todoId:string, userId:string, updatedTodo){
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done, #attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                  ":name": updatedTodo.name,
                  ":dueDate": updatedTodo.dueDate,
                  ":done": updatedTodo.done,
                  ":attachmentUrl": updatedTodo.attachmentUrl,
            },
            ExpressionAttributeNames: {
                  "#name": "name",
                  "#dueDate": "dueDate",
                  "#done": "done",
                  "#attachmentUrl": "attachmentUrl",
            },
            ReturnValues:"UPDATED_NEW"
          }).promise();
    }

}


function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
