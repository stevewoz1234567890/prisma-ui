import React from 'react';
import { shallow } from 'enzyme';
import withTransactionConnected, { withTransaction } from 'server/withTransaction';

class WrappedComponent extends React.Component {
  render = () => <div id="wrapped" />;
}

/** Unconnected HOC — shallow-friendly (react-redux connect() is not a class component). */
const Wrapped = withTransaction(WrappedComponent);
const WrappedConnected = withTransactionConnected(WrappedComponent);

const dispatchProp = () => jest.fn(() => Promise.resolve({}));

describe('server/withTransaction HOC', () => {
  describe('displayName', () => {
    it('sets correct name for named components', () => {
      expect(WrappedConnected.displayName).toBe('Connect(withTransaction(WrappedComponent))');
    });

    it('sets correct name for unnamed components', () => {
      expect(withTransactionConnected(() => <div />).displayName).toBe(
        'Connect(withTransaction(Component))',
      );
    });
  });

  describe('wrapper', () => {
    it('provides single action transaction callback as a prop', () => {
      const hocWrapper = shallow(<Wrapped dispatchAction={dispatchProp()} />);

      expect(Wrapped.displayName).toBe('withTransaction(WrappedComponent)');
      const inner = hocWrapper.find(WrappedComponent);

      expect(inner.prop('createTransaction')).toBeDefined();
    });

    it('provides multiple actions transaction callback as a prop', () => {
      const hocWrapper = shallow(<Wrapped dispatchAction={dispatchProp()} />);

      const inner = hocWrapper.find(WrappedComponent);

      expect(inner.prop('createTransactions')).toBeDefined();
    });

    it('has reference to dispatch function from mapDispatchToProps', () => {
      const hocWrapper = shallow(<Wrapped dispatchAction={dispatchProp()} />);
      const inner = hocWrapper.find(WrappedComponent);

      expect(inner.prop('dispatchAction')).toBeDefined();
    });
  });

  describe('createTransaction', () => {
    let createTransaction = null;
    /** Shallow root: WithTransaction (dispatchAction updates must use setProps here). */
    let hocWrapper = null;

    beforeEach(() => {
      hocWrapper = shallow(<Wrapped dispatchAction={dispatchProp()} />);
      createTransaction = hocWrapper.find(WrappedComponent).prop('createTransaction');
    });

    it('returns a promise', () => {
      hocWrapper.setProps({ dispatchAction: jest.fn(() => Promise.resolve({})) });

      expect(createTransaction({})).toBeInstanceOf(Promise);
    });

    it('calls dispatchAction with the provided action', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const callback = jest.fn(() => Promise.resolve({ data: true }));
      hocWrapper.setProps({
        dispatchAction: callback,
      });

      return createTransaction(action).then(() => {
        // disaptchAction called
        expect(callback.mock.calls.length).toBe(1);
        // dispatchAction called with action
        expect(callback.mock.calls[0][0]).toBe(action);
      });
    });

    it('returns response on success', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.resolve({ data: true })),
      });

      return createTransaction(action).then(response => {
        expect(response).toEqual({ data: true });
      });
    });

    it('rejects with error on 500 errors ', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        data: {
          error: 'FAILED',
        },
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action).catch(response => {
        expect(response.status).toBe(500);
        expect(response).toEqual(error);
      });
    });

    it('rejects with error on 500 but does not try to parse field errors ', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        data: [
          {
            message: 'Required non-empty property',
            property: 'name',
            rule: 'Required',
          },
        ],
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action).catch(response => {
        expect(response.status).toBe(500);
        expect(response).toEqual(error);
      });
    });

    it('rejects with error on 404 errors ', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        data: null,
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action).catch(response => {
        expect(response.status).toBe(404);
        expect(response).toEqual(error);
      });
    });

    it('rejects with error on 404 but does not try to parse field errors ', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        data: [
          {
            message: 'Required non-empty property',
            property: 'name',
            rule: 'Required',
          },
        ],
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action).catch(response => {
        expect(response.status).toBe(500);
        expect(response).toEqual(error);
      });
    });

    it('rejects with field errors on 400 errors ', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        data: [
          {
            message: 'Required non-empty property',
            property: 'name',
            rule: 'Required',
          },
        ],
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action).catch(response => {
        expect(response.status).toBe(400);
        expect(response.ok).toBe(false);
        expect(response.statusText).toBe('Bad Request');
        expect(response.data).toEqual(error.data);
        expect(response.fieldErrors.name).toEqual({
          message: 'Required non-empty property',
          property: 'name',
          rule: 'Required',
        });
      });
    });

    it('rejects on 400 and returns original if parseFieldErrors is false', () => {
      const action = { type: 'ACTION', payload: { test: 'TEST' } };
      const error = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        data: [
          {
            property: 'Some value',
          },
        ],
      };
      hocWrapper.setProps({
        dispatchAction: jest.fn(() => Promise.reject(error)),
      });
      return createTransaction(action, { parseFieldErrors: false }).catch(response => {
        expect(response).toEqual(error);
      });
    });
  });

  describe('createTransactions', () => {
    it('returns a promise', () => {
      const hocWrapper = shallow(<Wrapped dispatchAction={dispatchProp()} />);
      const createTransactions = hocWrapper.find(WrappedComponent).prop('createTransactions');
      expect(createTransactions()).toBeInstanceOf(Promise);
    });
  });
});
