// import fuzz from 'fuzzball';
// import constants from './constants.mjs';
// import getGreatCircleDistance from './sphereMath.mjs';

export default ({
  fuzz,
  FUZZY_MATCH_CUTOFF,
  DISTANCE_CUTOFF,
  sphereMath,
}) => {
  const self = {
    /**
     * Assembling function that scores all respondents, then filters and sorts the results
     * 
     * @param {object[]} respondents an array of respondent objects, the data parsed from the csv file
     * @param {object} criteria the project criteria data
     * @returns {object[]} all respondents within the search radius, sorted by total score, descending
     */
    getAllRespondentScores: ({
      respondents,
      criteria,
    } = {}) => {
      return respondents.map((respondent) => {
        const finalScore = self.getRespondentScore({respondent, criteria});
        return {
          firstName: respondent.firstName,
          distance: finalScore.distanceScore.shortestDistance,
          totalScore: finalScore.totalScore,
        };
      })
      .filter((score) => score.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore);
    },

    /**
     * Assembling function that calculates the total score for a single respondent based on their data and
     * the project criteria
     * 
     * @param {object} respondent a respondent object, a row parsed from the csv file
     * @param {object} criteria the project criteria data
     * @returns {object} all scores calculated for the respondent
     */
    getRespondentScore: ({
      respondent,
      criteria,
    } = {}) => {
      const distanceScore = self.getDistanceScore({ respondent, cities: criteria.cities });
      const industryScore = self.getIndustryMatchScore({
        respondentIndustries: respondent.industries,
        desiredIndustries: criteria.professionalIndustry,
      });
      const jobTitleScore = self.getJobTitleMatchScore({
        respondentJobTitle: respondent.jobTitle,
        desiredJobTitles: criteria.professionalJobTitles,
      });
      const totalScore = self.getTotalScore({
        distanceScore: distanceScore.score,
        industryScore, jobTitleScore,
      });

      return {
        distanceScore,
        industryScore,
        jobTitleScore,
        totalScore,
      };
    },

    /**
     * A function to calculate the simple average of the three input scores
     * 
     * @param {number} distanceScore 
     * @param {number} industryScore
     * @param {number} jobTitleScore
     * @returns {number} 0.0 - 1.0 the simple average of the three scores
     */
    getTotalScore: ({
      distanceScore,
      industryScore,
      jobTitleScore,
    } = {}) => {
      // if their distance score is 0, they are outside the search radius and should not be considered. Return a 0 for their entire score
      if (distanceScore <= 0) return 0;
      return (distanceScore + industryScore + jobTitleScore) / 3;
    },

    /**
     * Simple function to calculate a respondent's distance score based on their location and the list of cities in the project criteria
     * 
     * @param {object[]} respondent a respondent object, a row parsed from the csv file
     * @param {object[]} cities an array of cities from the project file
     * @returns {number} 0.0 -  1.0 the respondent's distance score, based on how close they are to one of the cities
     */
    getDistanceScore: ({
      respondent,
      cities,
    } = {}) => {
      const distance = self.getShortestDistance({ respondent, cities });
      return {
        score: 1 - (distance / DISTANCE_CUTOFF),
        shortestDistance: distance,
      };
    },

    /**
     * A function to find the shortest distance between a respondent and one of the cities listed in the project criteria
     * 
     * @param {object[]} respondent a respondent object, a row parsed from the csv file
     * @param {object[]} cities an array of cities from the project file
     * @returns {number} the distance between the respondent and the closest city
     */
    getShortestDistance: ({
      respondent,
      cities,
    } = {}) => {
      const result =  cities.reduce((acc, city) => {
        const distance = sphereMath.getGreatCircleDistance({
          latitude1: respondent.latitude,
          longitude1: respondent.longitude,
          latitude2: city.location.location.latitude,
          longitude2: city.location.location.longitude,
        });
        if (acc === null) {
          return distance;
        } else if (distance < acc) {
          return distance;
        } else {
          return acc;
        }
      }, null);
      return result;
    },

    /**
     * Assembling function to score a respondent based on their industries
     * 
     * @param {string[]} respondentIndustries the respondent's industries
     * @param {string[]} desiredIndustries the desired industries
     * @returns {number} 0.0 - 1.0 the respondent's score based on how well their industrie(s) matched the desired industries
     */
    getIndustryMatchScore: ({
      respondentIndustries = [],
      desiredIndustries = [],
    } = {}) => {
      const matches = self.batchExtractStringsFromArray({
        queries: respondentIndustries,
        givenChoices: desiredIndustries,
      });
      return self.getMatchScores({ matches, totalChoices: desiredIndustries.length });
    },

    /**
     * Assembling function to score a respondent based on their job title
     * 
     * @param {string} respondentJobTitle the respondent's job title
     * @param {string[]} desiredJobTitles the desired job titles
     * @returns {number} 0.0 - 1.0 the respondent's score based on how well their job title matched the desired titles
     */
    getJobTitleMatchScore: ({
      respondentJobTitle = '',
      desiredJobTitles = [],
    } = {}) => {
      const matches = self.extractStringFromArray({ query: respondentJobTitle, givenChoices: desiredJobTitles });
      return self.getMatchScores({ matches, totalChoices: desiredJobTitles.length });
    },

    /**
     * A function to build a score based on the number and quality of matches from a fuzzy string search.
     * The score it returns is the sum of the score of all matches that were above the cutoff, divided by the
     * total number of choices we were searching for.
     * 
     * @param {object[]} matches the array of matches returned by either of the extract functions below
     * @param {number} totalChoices the total number of available choices we were searching through
     * @returns {number} the match score
     */
    getMatchScores: ({
      matches,
      totalChoices = 0,
    } = {}) => {
      if (
        totalChoices === 0
        || totalChoices === null
        || totalChoices === undefined
      ) return 0;
      const sum = matches.reduce((a, match) => {
        return a + match.score;
      }, 0);
      return sum / totalChoices;
    },

    /**
     * Given an array of existant strings, query them with another array of strings for matches.
     * Returns a subset of the choices array that match the queries above the given cutoff confidence,
     * along with the highest matching score for that choice if it was matched by more than one query.
     * 
     * @param {string[]} queries the terms to be searched for
     * @param {string[]} givenChoices the dictionary of terms we would like to match against
     * @returns {object[]} all matched terms with their highest match score
     */
    batchExtractStringsFromArray: ({
      queries,
      givenChoices,
    } = {}) => {
      const allMatches = new Map();
      queries.forEach((string) => {
        const matches = self.extractStringFromArray({ query: string, givenChoices });
        // use the highest match score for each given choice. Use a map to keep track of the highest score for each
        matches.forEach((match) => {
          if (!allMatches.has(match.term) || allMatches.get(match.term) < match.score) {
            allMatches.set(match.term, match.score);
          }
        });
      });
      // convert from a map back to an array of objects to match the normalized pattern the rest of the code expects to see
      const result = [];
      allMatches.forEach((value, key) => result.push({ term: key, score: value }));
      return result;
    },

    /**
     * Given an array of strings, query them with another string for a match.
     * Returns a subset of the array that match above the cutoff confidence
     * 
     * @param {string} query the term to be searched for
     * @param {string[]} givenChoices the dictionary of terms to search
     * @returns {object[]} all matched terms with their score
     */
    extractStringFromArray: ({
      query,
      givenChoices,
    } = {}) => {
      return fuzz.extract(query, givenChoices)
        .filter((match) => match[1] > FUZZY_MATCH_CUTOFF)
        .map((match) => ({ term: givenChoices[match[2]], score: match[1] / 100 }));
    },
  };
  return self;
};
