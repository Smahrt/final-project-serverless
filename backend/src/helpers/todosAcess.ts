import type { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { getDocumentClient } from '@shelf/aws-ddb-with-xray';
import { AttachmentUtils } from './attachmentUtils';

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = getDocumentClient({
      ddbParams: { region: 'us-east-1' },
      ddbClientParams: { region: 'us-east-1' },
    }),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.INDEX_NAME) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    let items = result.Items as TodoItem[]

    // add attachmentUrl to the item
    for (const item of items) {
      item.attachmentUrl = AttachmentUtils.getAttachmentUrl(item.todoId)
    }

    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating a new todo')

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<TodoItem> {
    logger.info('Updating a todo')

    const result = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    }).promise();

    return result.Attributes as TodoItem;
  }

  async deleteTodo(
    todoId: string,
    userId: string
  ): Promise<void> {
    logger.info('Deleting a todo')

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()
  }

  async updateAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    logger.info('Updating an attachment URL', { todoId, userId, attachmentUrl })

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()

  }
}
