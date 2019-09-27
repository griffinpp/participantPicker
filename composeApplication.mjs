import path from 'path';
import fs from 'fs';
import util from 'util';
import Papa from 'papaparse';
import fuzz from 'fuzzball';
import awilix from 'awilix';
import sphereMath from './sphereMath.mjs';
import fileIO from './fileIO.mjs';
import logging from './logging.mjs';
import scoring from './scoring.mjs';
import main from './main.mjs';



export default function getContainer() {
  const { asValue, asFunction } = awilix;
  const container = awilix.createContainer();

  container.register({
    // constants
    EARTH_RADIUS: asValue(6371.0088), // in km.

    // configurables
    DISTANCE_CUTOFF: asValue(100), // in km. Respondents who are outside this radius will not be considered
    FUZZY_MATCH_CUTOFF: asValue(50), // between 0 (everything matches) and 100 (only exact matches). matches below the cutoff will not be considered at all
    
    // external modules can be registered as a value to have the container return them without trying to inject anything into them
    path: asValue(path),
    fs: asValue(fs),
    util: asValue(util),
    Papa: asValue(Papa),
    fuzz: asValue(fuzz),

    // our internal factory functions will have their dependencies injected automatically
    sphereMath: asFunction(sphereMath),
    fileIO: asFunction(fileIO),
    logging: asFunction(logging),
    scoring: asFunction(scoring),
    main: asFunction(main),
  });
  return container;
}
