import express from 'express';
import joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

router.post("/todos", async (req, res, next) => {
  try {
    // todo의 내용을 받아와야 하므로 req.body를 써서 value 데이터를 가져온다.
    // const { value } = req.body;
    const validation = await createdTodoSchema.validateAsync(req.body);
    const { value } = validation;

    // 만약 전달할 value 데이터가 없어서 클라이언트에서 못받아오면 에러 메시지 전달
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일(value) 데이터가 존재하지 않습니다." });
    }

    // findOne -> 한개의 데이터만 조회
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // MaxOrder가 있으면 거기 +1 해주고 없으면 1로 해줘
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ todo: todo });
  } catch (error) {
    // 라우터 다음에 있는 에러처리 미들웨어를 실행하게 해줌
    next(error);
  }
});

// 해야할 일 목록 조회
router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();

  return res.status(200).json({ todos });
});

router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, value, done } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 할 일 입니다!" });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (value) {
    currentTodo.value = value;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 할일 정보입니다." });
  }

  await Todo.deleteOne({ _id: todoId });
  return res.status(200).json({});
});

export default router;
