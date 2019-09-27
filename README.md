# Participant Picker

An application to rank and sort respondents based on how well their location, job title, and industry matches the provided criteria.

### Installation

    npm install
    
### Running

##### To run with the included sample files:

    npm run-script run
    
##### To run with custom files:

    node --experimental-modules index.mjs <relative path to project json file> <relative path to respondent csv file>
    
### Output 

Output will be all respondents that are within `DISTANCE_CUTOFF` (see below) of a city specified in the project json file, sorted by a score determined by how close they are to one of the cities, 
how well their job title matches one of the desired job titles, and how well their industry matches one of the desired industries. Output will include each respondent's name, distance (in km) to the closest
city, and their overall score:
    
      {
        "firstName": "Katie",
        "distance": 3.5547167450446344,
        "totalScore": 0.4522797320619724
      },

### Configuration

Configuration is minimal and consists of three constants that can be found near the top of `configureContainer.mjs`:
* EARTH_RADIUS - In km. Default 6371.0088. The radius of the earth. Can be changed if you find yourself on a different planet or in an alternate dimension.
* DISTANCE_CUTOFF - In km. Default 100. how far to search for matches. Candidates must be at least this close to one of the cities listed in the project json file to be considered.
* FUZZY_MATCH_CUTOFF - 0 to 100. Default 50. How lenient to be when matching text for job titles and industries. 100 means only exact matches, and 0 means everything matches. Tweak to taste, but 50 is a nice starting place.

### Testing

    npm run-script test
    
### Linting

    npm run-script lint

### Notes

#### .mjs files

I have preferred to stay away from babel and maintaining as simple of a configuration as possible.  This does mean that the `--experimental-modules`
flags has to be used, but that seems like a small price to pay for the wealth of functionality available without transpiling.

#### IoC container

Assembling an application with an IoC container adds a bit of complexity to JS, but I have found that the savings in how much easier it generally is to unit test
or swap out modules, or... do lots of things generally pays off. Awilix is an IoC container that I have used in the past with success.

Along with that, the factory functions make everything easy to assemble, test, and to a certain extent, swap around later if needed.

#### Destructured function input

Unless a function only has one input, I have chosen to use a destructrued object as its input. I consider it much easier to set up defaults,
not to mention keep track of which input is which when calling the function elsewhere.

#### External libraries

* Papa Parse - the king of csv parsing, in my experience. Lightning fast and highly configurable
* Fuzzball - no personal experience outside this project, but it is popular and its functionality fit what I was looking for, i.e. kept me from having to write my own levenshtein distance calculator.
* Awilix - I've used it before, and it's extremely an flexible IoC container and plays nice with a wide variety of objects and functions. There's basically nothing you can't shove in there.
* Ava - handles .mjs files with minimal config. Flat, simple, plays nice with sinon.

#### Scoring algorithm

Distance is a simple score that starts at 1.0 if your distance is 0, and goes to 0 as your distance approaches `DISTANCE_CUTOFF`.
Respondents with a distance score of 0.0 are eliminated from consideration altogether.

Job title and Industry scores are both determined using a fuzzy match against the desired terms. The fuzzy match confidence must exceed `FUZZY_MATCH_CUTOFF` to be considered a match. To convert these to a score, the confidences of all matches are divided by 100 to get a range between 0.0 and 1.0,
then summed and divided by the total number of desired terms. This means that these scores will generally be low, as respondents will probably never match all desired terms. It also means, however, that a respondent with
a single strong match will generally be outscored by one with a strong match plus a weak match. Other scoring algorithms tended to have respondents with a single strong match outscoring others that had a few less strong
matches, as their lower match confidences were pulling down their overall score.  Final score is a simple average of all three scores. If one criteria was deemed more important than the others, weights could be added with
little work, but they have been left out here.

#### Further considerations/things to improve

* Add configurable weights to the overall scoring system
* More tests - always a thing
* Wrap in an API and Dockerize - not much additional work, and now you've got a microservice...
* If going the service route, change cutoffs to be passable variables
