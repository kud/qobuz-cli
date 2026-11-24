// React ships a slower development build unless NODE_ENV is "production".
// Set it before ink/react load, without overriding an explicit value.
process.env.NODE_ENV ??= "production"

await import("./cli.js")
