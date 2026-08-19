import Joi from "joi";

export const createTaskSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .required(),

    description: Joi.string()
      .trim()
      .max(2000)
      .allow("")
      .default(""),

    project: Joi.string()
      .hex()
      .length(24)
      .required(),

    status: Joi.string()
      .valid(
        "todo",
        "in-progress",
        "in-review",
        "completed"
      )
      .default("todo"),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high"
      )
      .default("medium"),
  });

export const updateTaskSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .optional(),

    description: Joi.string()
      .trim()
      .max(2000)
      .allow("")
      .optional(),

    status: Joi.string()
      .valid(
        "todo",
        "in-progress",
        "in-review",
        "completed"
      )
      .optional(),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high"
      )
      .optional(),
  }).min(1);