import Joi from "joi";

export const updateProfileSchema =
  Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional(),

    lastName: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .optional(),
  }).min(1);

export const changePasswordSchema =
  Joi.object({
    currentPassword: Joi.string()
      .min(6)
      .required(),

    newPassword: Joi.string()
      .min(6)
      .max(100)
      .required(),
  });

export const deleteAccountSchema =
  Joi.object({
    password: Joi.string()
      .min(6)
      .required(),
  });