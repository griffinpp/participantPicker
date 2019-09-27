export default () => {
  const self = {
    /**
     * Super basic logging function
     * @param object any object to be logged
     */
    log: (object) => {
      console.log(JSON.stringify(object, null, 2));
    },

    /**
     * Super basic warning logging function
     * @param object any object to be logged
     */
    warn: (object) => {
      console.warn(JSON.stringify(object, null, 2));
    },

    /**
     * Super basic error logging function
     * @param object any object to be logged
     */
    error: (object) => {
      console.error(JSON.stringify(object, null, 2));
    },
  };
  return self;
};
