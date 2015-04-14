import Surface from '../../src/surfaces';

var surface;
describe('orient()', () => {
  describe('when calling orient()', () => {
    beforeEach(() => {
      surface = new Surface({
        yaw: 0,
        pitch: 0,
        maxPitch: Math.PI
      });
    });

    describe('and not passing anything in', () => {
      beforeEach(() => {
        surface.orient();
      });

      it('should not change the yaw and pitch if nothing is passed in', () => {
        expect(surface.yaw).to.equal(0);
        expect(surface.pitch).to.equal(0);
      });
    });

    describe('and passing in a new yaw, but not a new pitch', () => {
      beforeEach(() => {
        surface.orient({
          yaw: 5
        });
      });

      it('should change the yaw, but not the pitch', () => {
        expect(surface.yaw).to.equal(5);
        expect(surface.pitch).to.equal(0);
      });
    });

    describe('and passing in a new pitch, but not a new yaw', () => {
      beforeEach(() => {
        surface.orient({
          pitch: 2
        });
      });

      it('should change the yaw, but not the pitch', () => {
        expect(surface.pitch).to.equal(2);
        expect(surface.yaw).to.equal(0);
      });
    });

    describe('and passing in both a new yaw and pitch', () => {
      beforeEach(() => {
        surface.orient({
          pitch: 2,
          yaw: 3
        });
      });

      it('should update both the yaw and the pitch', () => {
        expect(surface.pitch).to.equal(2);
        expect(surface.yaw).to.equal(3);
      });
    });

    describe('and passing a pitch that exceeds the maxPitch in the + direction', () => {
      beforeEach(() => {
        surface.orient({
          pitch: 5
        });
      });

      it('should prevent it from going beyond the maxPitch', () => {
        expect(surface.pitch).to.equal(Math.PI);
      });
    });

    describe('and passing a pitch that exceeds the maxPitch in the - direction', () => {
      beforeEach(() => {
        surface.orient({
          pitch: -5
        });
      });

      it('should prevent it from going beyond the -maxPitch', () => {
        expect(surface.pitch).to.equal(-Math.PI);
      });
    });
  });
});