export default ({
  EARTH_RADIUS,
}) => {
  const self = {
    /**
     * Calculates the great circle distance, in km, between two points on the earth's surface,
     * given their latitude and longitude
     * 
     * @param {number} latitude1 latitude of the first point
     * @param {number} longitude1 longitude of the first point
     * @param {number} latitude2 latitude of the second point
     * @param {number} longitude2 longitude of the second point
     * @returns {number} great circle distance, in km, between the two points
     */
    getGreatCircleDistance: ({
      latitude1, 
      longitude1,
      latitude2,
      longitude2,
    } = {}) => {
      const centralAngle = self.getCentralAngle({ latitude1, longitude1, latitude2, longitude2 });
      return EARTH_RADIUS * centralAngle;
    },

    /**
     * Calculates the central angle between two points, given their latitude and longitude
     * 
     * @param {number} latitude1 latitude of the first point
     * @param {number} longitude1 longitude of the first point
     * @param {number} latitude2 latitude of the second point
     * @param {number} longitude2 longitude of the second point
     * @returns {number} central angle between the two points
     */
    getCentralAngle: ({
      latitude1, 
      longitude1,
      latitude2,
      longitude2,
    } = {}) => {
      const rLatitude1 = self.convertToRadians(latitude1);
      const rLongitude1 = self.convertToRadians(longitude1);
      const rLatitude2 = self.convertToRadians(latitude2);
      const rLongitude2 = self.convertToRadians(longitude2);

      const prodOfSines = Math.sin(rLatitude1) * Math.sin(rLatitude2);
      const prodOfCosines = Math.cos(rLatitude1) * Math.cos(rLatitude2) * Math.cos(Math.abs(rLongitude1 - rLongitude2));
      return Math.acos(prodOfSines + prodOfCosines);
    },

    /**
     * Converts an angle from degrees to radians
     * 
     * @param {number} angleInDegrees floating point number representing the angle to be converted
     * @returns {number} floating point number representing the same angle in radians
     */
    convertToRadians: (angleInDegrees) => {
      return angleInDegrees * (Math.PI / 180);
    }
  };
  return self;
};
