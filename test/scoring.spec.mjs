import test from 'ava';
import sinon from 'sinon';
import sutFactory from '../scoring.mjs';

const FUZZY_MATCH_CUTOFF = 50;
const DISTANCE_CUTOFF = 100;

const fuzzStub = {
  extract: sinon.stub().returns([
    ['one', 85, 0],
    ['three', 52, 2],
    ['two', 22, 1]
  ]),
};

const sphereMathStub = {
  getGreatCircleDistance: sinon.stub(),
};

const respondent = {
  latitude: 0,
  longitude: 0,
};
const cities = [
  {
    location: {
      location: {
        latitude: 50,
        longitude: 50,
      },
    },
  },
  {
    location: {
      location: {
        latitude: 80,
        longitude: 80,
      },
    },
  },
  {
    location: {
      location: {
        latitude: 30,
        longitude: 30,
      },
    },
  }
];

test('getAllRespondentScores() calls getRespondentScore() for each respondent and returns filtered sorted output', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  sut.getRespondentScore = sinon.stub();
  sut.getRespondentScore.onCall(0).returns({
    distanceScore: {
      shortestDistance: 39,
    },
    totalScore: 0.65,
  });
  sut.getRespondentScore.onCall(1).returns({
    distanceScore: {
      shortestDistance: 102,
    },
    totalScore: 0.0,
  });
  sut.getRespondentScore.onCall(2).returns({
    distanceScore: {
      shortestDistance: 3,
    },
    totalScore: 0.92,
  });
  const result = sut.getAllRespondentScores({
    respondents: [{ firstName: 'bill'}, { firstName: 'joe' }, { firstName: 'cathleen' }],
    criteria: {},
  });

  // there should be 2 results, the 0.92 score followed by the 0.65 score. the 0.0 score should be omitted
  t.is(result.length, 2);
  t.is(result[0].totalScore, 0.92);
  t.is(result[1].totalScore, 0.65);
});

// getRespondentScore() is strictly an assembling function

test('getTotalScore() returns the correct total score', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  const result1 = sut.getTotalScore({
    distanceScore: 0.2,
    jobTitleScore: 0.5,
    industryScore: 0.8,
  });
  const result2 = sut.getTotalScore({
    distanceScore: 0.0,
    jobTitleScore: 0.9,
    industryScore: 1.0,
  });

  t.is(result1, 0.5);
  // distance score being zero should zero your total score
  t.is(result2, 0.0);
});

test('getDistanceScore() returns the correct score based on the shortest distance', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  sut.getShortestDistance = sinon.stub().returns(60);
  const result = sut.getDistanceScore({
    respondent,
    cities,
  });

  t.deepEqual(result, {
    // note that this will have to change if DISTANCE_CUTOFF is changed
    score: 0.4,
    shortestDistance: 60,
  });
});

test('getShortestDistance() returns the distance to the closest city', t => {
  sphereMathStub.getGreatCircleDistance.reset();
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  sphereMathStub.getGreatCircleDistance.onCall(0).returns(85);
  sphereMathStub.getGreatCircleDistance.onCall(1).returns(45);
  sphereMathStub.getGreatCircleDistance.onCall(2).returns(52);
  
  const result = sut.getShortestDistance({
    respondent,
    cities,
  })
  t.is(result, 45);
});

// getIndustryMatchScore() is strictly an assembling function

// getJobTitleMatchScores() is strictly an assembling function

test('getMatchScores() calculates match scores correctly', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  const matches = [
    { term: 'one', score: 0.5 },
    { term: 'two', score: 0.8 },
  ]
  const result = sut.getMatchScores({
    matches,
    totalChoices: 4,
  });
  t.is(result, (0.5 + 0.8) / 4);
});

test('batchExtractStringsFromArray() uses extractStringFromArray to match strings', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  // stub out the internal fn
  sut.extractStringFromArray = sinon.stub();
  sut.extractStringFromArray.onCall(0).returns([
    { term: 'one', score: 0.85 },
    { term: 'three', score: 0.53 },
  ]);
  sut.extractStringFromArray.onCall(1).returns([
    { term: 'one', score: 0.65 },
    { term: 'three', score: 0.92 },
  ]);
  sut.batchExtractStringsFromArray({
    queries: ['urn', 'tree'],
    givenChoices: ['one', 'two', 'three'],
  });
  t.is(sut.extractStringFromArray.calledWith({ query: 'urn', givenChoices: ['one', 'two', 'three'] }), true);
  t.is(sut.extractStringFromArray.calledWith({ query: 'tree', givenChoices: ['one', 'two', 'three'] }), true);
  t.is(sut.extractStringFromArray.calledTwice, true);
});

test('batchExtractStringsFromArray() correctly combines scores in the result', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  // stub out the internal fn
  sut.extractStringFromArray = sinon.stub();
  sut.extractStringFromArray.onCall(0).returns([
    { term: 'one', score: 0.85 },
    { term: 'three', score: 0.53 },
  ]);
  sut.extractStringFromArray.onCall(1).returns([
    { term: 'one', score: 0.65 },
    { term: 'three', score: 0.92 },
  ]);
  const result = sut.batchExtractStringsFromArray({
    queries: ['urn', 'tree'],
    givenChoices: ['one', 'two', 'three'],
  });
  t.deepEqual(result, [{ term: 'one', score: 0.85 }, { term: 'three', score: 0.92 }]);
});

test('extractStringFromArray() uses fuzzball to match strings', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  sut.extractStringFromArray({
    query: 'one', 
    givenChoices: ['one', 'two', 'three'],
  });
  t.is(fuzzStub.extract.calledWith('one', ['one', 'two', 'three']), true);
});

test('extractStringFromArray() correctly uses the cutoff value', t => {
  const sut = sutFactory({
    fuzz: fuzzStub,
    FUZZY_MATCH_CUTOFF,
    DISTANCE_CUTOFF,
    sphereMath: sphereMathStub,
  });
  const result = sut.extractStringFromArray({
    query: 'one', 
    givenChoices: ['one', 'two', 'three'],
  });
  const filteredResult = result.filter(r => r.score <= (FUZZY_MATCH_CUTOFF / 100));
  // there should be no results with a score below the cutoff
  t.is(filteredResult.length, 0);
});
