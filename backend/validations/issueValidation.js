import Joi from "joi";

export const createIssueSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .required(),

    description: Joi.string()
      .trim()
      .max(3000)
      .allow("")
      .default(""),

    project: Joi.string()
      .hex()
      .length(24)
      .required(),

    status: Joi.string()
      .valid(
        "open",
        "in-progress",
        "resolved",
        "closed"
      )
      .default("open"),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high",
        "critical"
      )
      .default("medium"),
  });

export const updateIssueSchema =
  Joi.object({
    title: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .optional(),

    description: Joi.string()
      .trim()
      .max(3000)
      .allow("")
      .optional(),

    status: Joi.string()
      .valid(
        "open",
        "in-progress",
        "resolved",
        "closed"
      )
      .optional(),

    priority: Joi.string()
      .valid(
        "low",
        "medium",
        "high",
        "critical"
      )
      .optional(),
  }).min(1);