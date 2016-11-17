require.extensions['.css'] = require.extensions['.scss'] = () => ({});

// required to get the require.extensions hack to work
const FlexModalWrapper = require('../lib/FlexModalWrapper');
const jsdom = require('jsdom');

import Portal from '@1stdibs/react-portal';
import TestUtils from 'react-addons-test-utils';
import assert from 'assert';
import { mount } from 'enzyme';
import {execSync} from 'child_process';

describe('package', function () {
    this.timeout(10000);
    it('should work without a global dom', function () {
        execSync('npm run build');
        execSync('node dist');
    });
});

describe('FlexModalWrapper', () => {
  let React;

  beforeEach(() => {
    // Set up JSDOM
    global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
    global.window = document.defaultView;
    global.navigator = {userAgent: 'node.js'};
    // Enzyme library uses React
    React = require('react');
  });

  it('propTypes.children should be required', () => {
    assert.equal(FlexModalWrapper.propTypes.children, React.PropTypes.node.isRequired);
  });

  it('should append modal wrapper to document.body via isOpened prop', () => {
    const wrapper = mount(<FlexModalWrapper isOpened><p className="someclass">Hi</p></FlexModalWrapper>);
    assert.equal(document.body.childElementCount, 1);
    // This line is very dependent on react-portal. Will break after
    // switching modules but shouldn't matter, just needs rewrite.
    // Also the first `node` is enzyme.ReactWrapper's and the second is react-portal's
    assert.equal(document.body.lastElementChild, wrapper.find(Portal).node.node);
    assert.equal(document.getElementsByTagName('p')[0].className, 'someclass');
  });

  it('should not render modal without isOpened', () => {
    const wrapper = mount(<FlexModalWrapper><p>Hi</p></FlexModalWrapper>);
    assert.equal(document.body.childElementCount, 0);
    assert.equal(document.getElementsByTagName('p').length, 0);
  });

  it('should add className to the wrapping element of the children', () => {
    const props = {
      isOpened: true,
      className: 'some-class'
    };
    const wrapper = mount(<FlexModalWrapper {...props}><p>Hi</p></FlexModalWrapper>);
    assert.equal(document.getElementsByClassName(props.className).length, 1);
  });

  it('should pass in props.closeModal into each of it\'s props.children', () => {
    let closeModal;
    const Child = React.createClass({
      propTypes: {
        closeModal(props, propName) {
          closeModal = props[propName];
        }
      },
      callCloseModal() { this.props.closeModal() },
      render() { return <span>A Child</span> }
    });
    const wrapper = mount(<FlexModalWrapper isOpened><Child /></FlexModalWrapper>);
    assert.equal(typeof closeModal, 'function');
    assert.equal(document.body.childElementCount, 1);
    assert.equal(wrapper.instance().modal.props.closePortal, closeModal);
    closeModal();
    assert.equal(document.body.childElementCount, 0);
  });

  it('should close on outside click', () => {
    mount(<FlexModalWrapper isOpened closeOnOutsideClick><p>Hi</p></FlexModalWrapper>);
    assert.equal(document.body.childElementCount, 1);
    const mouseEvent = new window.MouseEvent('mousedown', { view: window });
    document.dispatchEvent(mouseEvent);
    assert.equal(document.body.childElementCount, 0);
  });

  describe('overlay', () => {
    it('defaults useOverlay to true', () => {
      const wrapper = mount(<FlexModalWrapper><p>Hi</p></FlexModalWrapper>);
      assert(wrapper.props().useOverlay);
    });

    it('supports overlayClassName', () => {
      const props = {
        isOpened: true,
        className: 'some-class',
        overlayClassName: 'overlay-class'
      };
      const wrapper = mount(<FlexModalWrapper {...props}><p>Hi</p></FlexModalWrapper>);
      const overlayResults = document.getElementsByClassName(props.overlayClassName);
      assert.equal(overlayResults.length, 1);
      assert(overlayResults[0].firstElementChild.classList.contains(props.className));
    });

    it('supports overlayStyle', () => {
      const props = {
        isOpened: true,
        className: 'some-class',
        overlayStyle: {backgroundColor: 'rgb(17, 34, 51)'}
      };
      const wrapper = mount(<FlexModalWrapper {...props}><p>Hi</p></FlexModalWrapper>);
      const childEl = document.getElementsByClassName(props.className)[0];
      assert.equal(childEl.parentElement.style.backgroundColor, 'rgb(17, 34, 51)');
    });
  });

  describe('preventScrolling', () => {
    it('should default preventScrolling to true', () => {
      const wrapper = mount(<FlexModalWrapper><p>Hi</p></FlexModalWrapper>);
      assert(wrapper.props().preventScrolling);
    });

    it('should set document.body.style.overflow to hidden', () => {
      const wrapper = mount(<FlexModalWrapper isOpened><p>Hi</p></FlexModalWrapper>);
      assert.equal(document.body.style.overflow, 'hidden');
    });
  });
});
