import * as AWS  from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import {TodoItem} from "../../models/TodoItem"
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

//const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {

  constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
      ) {
  }

  async create(item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
          TableName: this.todosTable,
          Item: item
        }).promise()
    
        return item;
  }

  async remove(todoId: string) {
      await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
              todoId
          }
      }).promise();
  }

    async getTodos(userId:string): Promise<TodoItem[]> {
      
        const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.todosCreatedAtIndex,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId
          }
        }).promise()
    
        const items = result.Items[0];
        return items as TodoItem[];
    }

    

    async modify(todoId:string, userId:string, updatedTodo:UpdateTodoRequest){
        return await this.docClient.update({
              TableName: this.todosTable,
              Key: {
                  todoId,
                  userId
              },
              UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
              ExpressionAttributeValues: {
                    ":name": updatedTodo.name,
                    ":dueDate": updatedTodo.dueDate,
                    ":done": updatedTodo.done,
              },
              ExpressionAttributeNames: {
                    "#name": "name",
                    "#dueDate": "dueDate",
                    "#done": "done",
              },
              ReturnValues:"UPDATED_NEW"
          }).promise();
    }

}


function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new AWS.DynamoDB.DocumentClient({ //XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new AWS.DynamoDB.DocumentClient() //XAWS.DynamoDB.DocumentClient()
  }
