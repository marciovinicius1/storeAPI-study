import setupApp from './app.js'
const port = 3000

;(async () => {
  try {
    /**
     * promise that initializes the database and configures the application
     */
    const app = await setupApp()
    /**
     * initialize the server on port
     */
    const server = app.listen(port, () =>
      console.info(`⚡| Server is running on port ${port}!`),
    )
    /**
     * @params SIGINT   system interruption
     * @params SIGTERM  system termination (commonly used)
     * @params SIGQUIT  abandonment, forced termination
     */
    const exitSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT']
    exitSignals.map((sig) =>
      process.on(sig, () =>
        server.close((err) => {
          if (err) {
            console.error(err)
            process.exit(1)
          }
          app.database.connection.close(function () {
            close.info('⛔| Database connection closed!')
            process.exit(0)
          })
        }),
      ),
    )
  } catch (error) {
    if (error) {
      console.error(error)
      process.exit(1)
    } else {
      return
    }
  }
})()

