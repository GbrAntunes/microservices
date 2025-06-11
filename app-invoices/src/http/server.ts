import "../broker/subscriber.ts"
import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"

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

app.listen({ host: "0.0.0.0", port: 3334 }).then(() => {
  console.log("[Invoices] HTTP server running at :3334")
})
