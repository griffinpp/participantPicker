import composeApplication from './composeApplication.mjs';

async function launch() {
  const container = composeApplication();
  const main = container.cradle.main;
  await main.process({
    respondentsFilePath: process.argv[3],
    projectFilePath: process.argv[2],
  });
}

launch();
