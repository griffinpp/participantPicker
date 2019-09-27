export default ({
  fileIO,
  logging,
  scoring,
}) => {
  const self = {
    process: async ({
      respondentsFilePath,
      projectFilePath,
    } = {}) => {
      const respondentsObject = await fileIO.getRespondents(respondentsFilePath);
      const projectObject = await fileIO.getProject(projectFilePath);
      const scores = scoring.getAllRespondentScores({
        respondents: respondentsObject,
        criteria: projectObject,
      });
      logging.log(scores);
    },
  };
  return self;
};
