import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { sendValidationError } from '../utils/response';

export const validate = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      }, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }));
        return sendValidationError(res, errors[0].message);
      }
      next(error);
    }
  };
}; 