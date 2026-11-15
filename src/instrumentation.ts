export async function register() {
  // Solo en Node.js: la validación termina el proceso, y process.exit no existe en Edge.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node")
  }
}
