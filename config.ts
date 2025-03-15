export const config = {
    jwtSecret: process.env.JWT_SECRET as string || "secret",
    port: process.env.PORT as string || 3000,
    // Add other configuration options here
}

export default config;