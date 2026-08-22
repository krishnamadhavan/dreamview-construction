import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    admin?: { id: string; email: string };
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    adminId: string;
    email: string;
  }
}
