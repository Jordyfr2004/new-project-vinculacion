

export default () => ({
    app: {
        port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
        env: process.env.NODE_ENV || 'development',
    },
    database: {
        url: process.env.DATABASE_URL,
    }
})