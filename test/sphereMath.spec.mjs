import test from 'ava';
import sutFactory from '../sphereMath.mjs';

const EARTH_RADIUS =  6371.0088;

const ninetyDegrees = {
  latitude1: 0,
  longitude1: 0,
  latitude2: 0,
  longitude2: 90,
};

test('getGreatCircleDistance() calculates the distance between two points', t => {
  const sut = sutFactory({
    EARTH_RADIUS,
  });
  // simple example to check. 90 degress apart should be (PI/2 radians * earth's radius) distance
  t.is(sut.getGreatCircleDistance(ninetyDegrees), (Math.PI / 2) * EARTH_RADIUS);
});

test('getCentralAngle() calculates the central angle between two points', t => {
  const sut = sutFactory({
    EARTH_RADIUS,
  });
  t.is(sut.getCentralAngle(ninetyDegrees), Math.PI / 2);
});

test('convertToRadians() converts degrees to radians', t => {
  const sut = sutFactory({
    EARTH_RADIUS,
  });
  // some easily verified conversions
  t.is(sut.convertToRadians(360), Math.PI * 2);
  t.is(sut.convertToRadians(180), Math.PI);
  t.is(sut.convertToRadians(90), Math.PI / 2)
})