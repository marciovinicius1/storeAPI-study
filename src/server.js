import setupApp from "./app.js";
const port = 3000;

(async () => {
  try {
    // promisse que inicializa o banco de dados e configura a aplicaçao
    const app = await setupApp();
    // inicializa o servidor na porta
    const server = app.listen(port, () =>
      console.info(`⚡| Server is running on port ${port}!`)
    );

    // SIGINT => Interrupçao do sistema
    //SIGTERM => finalizaçao do sistema (normamente utilizada)
    //SIGQUIT => abandono, finalização forçada
    const exitSignals = ["SIGINT", "SIGTERM", "SIGQUIT"];
    exitSignals.map((sig) =>
      process.on(sig, () =>
        server.close((err) => {
          if (err) {
            console.error(err);
            process.exit(1);
          }
          app.database.connection.close(function () {
            close.info("⛔| Database connection closed!");
            process.exit(0);
          });
        })
      )
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
