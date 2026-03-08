import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.identify.path, async (req, res) => {
    try {
      const input = api.identify.input.parse(req.body);
      const email = input.email === "" ? undefined : input.email;
      const phoneNumber = input.phoneNumber === "" ? undefined : input.phoneNumber;
      
      const result = await storage.identifyContact(email, phoneNumber);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
