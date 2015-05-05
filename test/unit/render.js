import Surface from '../../src/surfaces';

var surface;
describe('render()', () => {
  describe('when calling render() after creating a new Surface with no options', () => {
    beforeEach(() => {
      surface = new Surface();

      // Stub the call to the actual render of the canvas, or else JSDom explodes
      surface._renderCanvasSurface = sinon.stub();
    });

    it('should not throw an error', () => {
      expect(() => {
        surface.render();
      }).to.not.throw();
    });
  });
});