import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import configureMockStore from 'redux-mock-store';
import { setupMapboxGlMocks } from '../../../test/mapboxMock';
import ConnectedMapRedux, { ConnectedMap } from './ConnectedMap';

jest.mock('mapbox-gl');

const mockStore = configureMockStore([]);

const mapProps = () => ({
  mapLoaded: jest.fn(),
  createMap: jest.fn(),
  setOutputFeatureFromDraw: jest.fn(),
  generatedStyle: {},
});

describe('redux.ConnectedMap', () => {
  let store = null;
  beforeEach(() => {
    setupMapboxGlMocks(mapboxgl);
    store = mockStore({
      '@prisma/map': {
        map: { mapIds: [] },
        features: {},
        layers: {},
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders', () => {
    shallow(<ConnectedMap mapId="map" {...mapProps()} />);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(
      <Provider store={store}>
        <ConnectedMapRedux mapId="map" />
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });

  describe('onLoad', () => {
    it('doesnt error without onLoad callback', () => {
      const wrapper = shallow(<ConnectedMap mapId="map" {...mapProps()} />);

      wrapper.instance().onLoad({}, {});
    });

    it('calls onLoad with style and map.', () => {
      const style = { name: 'foo' };
      const map = { id: 'map' };
      const onLoad = jest.fn();

      const wrapper = shallow(
        <ConnectedMap mapId="map" onLoad={onLoad} {...mapProps()} />,
      );

      wrapper.instance().onLoad(style, map);

      expect(onLoad).toHaveBeenCalledWith(style, map);
    });
  });

  describe('mapId', () => {
    // TODO: handle all the types of map ids
  });
});
