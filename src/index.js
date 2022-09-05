const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    return response.status(404).json({ error: "Usuário não existe" });
  }

  request.user = userExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const exists = users.some((user) => user.username === username);

  if (exists) {
    return response.status(400).json({ error: "Usuário já cadastrado" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  todo.done = true;

  return response.status(201).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const exists = user.todos.some((todo) => todo.id === id);

  if (!exists) {
    return response.status(404).send({ error: "Todo não existe" });
  }

  const todos = user.todos.filter((todo) => todo.id !== id);

  user.todos = todos;

  return response.status(204).send();
});

module.exports = app;
