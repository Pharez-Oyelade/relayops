// import { Request, Response, NextFunction } from "express";
// import { ZodObject, ZodError } from "zod";

// export const validateRequest =
//   (schema: ZodObject<any>) =>
//   async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const validatedData = await schema.parseAsync({
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });

//       req.body = validatedData.body;
//       req.query = validatedData.query as Request["query"];
//       req.params = validatedData.params as Request["params"];
//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         next(error);
//         return;
//       }
//       next(error);
//     }
//   };

import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body ?? {},
        query: req.query ?? {},
        params: req.params ?? {},
      })) as {
        body?: unknown;
        query?: Record<string, unknown>;
        params?: Record<string, string>;
      };

      // 1. req.body is still a standard writable property in Express 5
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      // 2. Express 5 fix: Override the read-only prototype getter on this `req` instance
      // so controllers receive Zod's coerced & stripped query values (e.g. numbers/booleans)
      if (parsed.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      // 3. Safely update req.params
      if (parsed.params !== undefined) {
        Object.defineProperty(req, "params", {
          value: parsed.params,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
