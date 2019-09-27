export default ({
  path,
  fs,
  util,
  Papa,
}) => {
  const asyncReadFile = util.promisify(fs.readFile);
  const self = {
    /**
     * Assembling function that opens the project file and parses the json inside
     * @param {string} filePath the relative path to the json file to open
     * @returns {object} the parsed json file
     */
    getProject: async (filePath) => {
      const fullPath = path.join(process.cwd(), filePath);
      const contents = await asyncReadFile(fullPath, { encoding: 'utf8' });
      return JSON.parse(contents);
    },

    /**
     * Assembling function that opens the respondents csv file and parses the text inside
     * @param {string} filePath the relative path to the csv file to open
     * @returns {object[]}
     */
    getRespondents: async (filePath) => {
      const fullPath = path.join(process.cwd(), filePath);
      const contents = await asyncReadFile(fullPath, { encoding: 'utf8' });
      const parsedResult = await self.parseRespondentFile(contents);
      return parsedResult;
    },

    /**
     * Parses a csv string into an array of objects
     * @param {string} csvFileContents  the contents of a csv file, in string form
     * @returns {object[]}
     */
    parseRespondentFile: async (csvFileContents) => {
      const result = await Papa.parse(csvFileContents, { header: true });
      return result.data.map(({
        firstName,
        gender,
        jobTitle,
        industry,
        city,
        latitude,
        longitude,
      }) => {
        return {
          firstName,
          gender,
          jobTitle,
          industries: industry ? industry.split(',') : undefined,
          city,
          latitude,
          longitude,
        };
      });
    },
  };
  return self;
};
