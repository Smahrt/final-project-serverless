import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import AWS from "aws-sdk";

// TODO: Implement businessLogic
const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const createTodo = async (
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const todosAccess = new TodosAccess()

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
  }

  return await todosAccess.createTodo(newItem)
}

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  const todosAccess = new TodosAccess();
  const result = await todosAccess.getAllTodos(userId);
  return result;
}

export const updateTodo = async (
  todoId: string,
  userId: string,
  updatedTodo: UpdateTodoRequest
): Promise<TodoItem> => {
  const todosAccess = new TodosAccess();
  const result = await todosAccess.updateTodo(
    todoId,
    userId,
    updatedTodo
  );
  return result;
}

export const deleteTodo = async (
  todoId: string,
  userId: string
): Promise<void> => {
  const todosAccess = new TodosAccess();
  await todosAccess.deleteTodo(
    todoId,
    userId
  );
}

export const updateAttachmentUrl = async (
  todoId: string,
  userId: string
): Promise<string> => {
  const todosAccess = new TodosAccess();
  const attachmentUrl = await AttachmentUtils.generateUploadUrl(todoId)

  await todosAccess.updateAttachmentUrl(todoId, userId, attachmentUrl);

  return attachmentUrl
}

export const getTodo = async (
  todoId: string,
  userId: string
): Promise<TodoItem> => {
  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    }
  }).promise()

  if (!result.Item) {
    throw new createError.NotFound('Todo not found')
  }

  return result.Item as TodoItem
}

