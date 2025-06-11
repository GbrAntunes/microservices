import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"
import { orders } from "../broker/channels/orders.ts"
import { channels } from "../broker/channels/index.ts"
import { db } from "../db/client.ts"
import { schema } from "../db/schema/index.ts"
import { dispatchOrderCreated } from "../broker/messages/order-created.ts"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: "*" })

/**
 * Rota Health -> verifica se a aplicação está respondendo
 *
 * Escalonamento horizontal -> cria novas máquinas à medida que o load balancer envia mais dados
 * Deploy: Blue-green deployment -> versão 2 começa a receber tráfego gradativamente
 */

app.get("/health", () => {
  return 'OK'
})

app.post("/orders", {
  schema: {
    body: z.object({
      amount: z.number(),
    })
  }
}, async (request, reply) => {
  const { amount } = request.body

  console.log("Creating an order with amount ", amount)

  const orderId = randomUUID()

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: '123123'
    }
  })

  await db.insert(schema.orders).values({
    id: orderId,
    customerId: '123123',
    amount,
  })

  return reply.status(201).send()
})

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP server running at :3333")
})
