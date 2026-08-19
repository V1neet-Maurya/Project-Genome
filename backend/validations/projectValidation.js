import Joi from "joi";

export const createProjectSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    description: Joi.string()
      .trim()
      .max(1000)
      .allow("")
      .default(""),

    status: Joi.string()
      .valid(
        "planning",
        "active",
        "completed",
        "archived"
      )
      .default("planning"),
  });

export const updateProjectSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    description: Joi.string()
      .trim()
      .max(1000)
      .allow("")
      .optional(),

    status: Joi.string()
      .valid(
        "planning",
        "active",
        "completed",
        "archived"
      )
      .optional(),
  }).min(1);