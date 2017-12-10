import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import Portal from 'react-body-subtree';
import css from './FlexModalWrapper.css';

class ModalWrapper extends React.Component {
  constructor() {
    super();
    this.state = {
      scrollPosition: 0
    };
    this.handleMouseClickOutside = this.handleMouseClickOutside.bind(this);
  }

  saveScrollPosition() {
    this.setState({
        scrollPosition: window.pageYOffset
    });
  }

  restoreScrollPosition() {
    return window.scrollTo(0, this.state.scrollPosition);
  }

  componentDidMount() {
    if (!document) {
      return;
    }
    if (this.props.closeOnOutsideClick) {
      document.addEventListener('mousedown', this.handleMouseClickOutside, { capture: true });
    }
    if (this.props.preventScrolling) {
      this.saveScrollPosition();
      document.body.classList.add(css.noScroll);
    }
  }

  componentWillUnmount() {
    if (!document) {
      return;
    }
    document.removeEventListener('mousedown', this.handleMouseClickOutside, { capture: true });
    if (this.props.preventScrolling) {
      document.body.classList.remove(css.noScroll);
      this.restoreScrollPosition();
    }
  }

  handleMouseClickOutside(e) {
    const rootNode = findDOMNode(this.refs.content);
    if (rootNode.contains(e.target) || e.button !== 0) {
      return;
    }
    e.stopPropagation();
    this.props.closePortal();
  }

  render() {
    const { className, useOverlay, overlayClassName, overlayStyle, closePortal: closeModal } = this.props;
    const modalwrapper = (
      <div className={className ? `${css.flexModalWrapper} ${className}` : css.flexModalWrapper} ref="content">
        {React.Children.map(this.props.children, (c) => React.cloneElement(c, {closeModal}))}
      </div>
    );
    let overlay;
    if (useOverlay) {
      if (overlayStyle) {
        overlay = <div className={css.flexModalOverlay} style={overlayStyle}>{modalwrapper}</div>;
      } else {
        overlay = <div className={`${css.flexModalOverlay} ${overlayClassName || css.overlayStyle}`}>{modalwrapper}</div>;
      }
    } else {
      overlay = <div className={css.flexModalOverlay}>{modalwrapper}</div>;
    }
    return overlay;
  }
}

ModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  useOverlay: PropTypes.bool,
  overlayStyle: PropTypes.object,
  overlayClassName: PropTypes.string,
  closeOnOutsideClick: PropTypes.bool,
  preventScrolling: PropTypes.bool,
  // passed by Portal
  closePortal: PropTypes.func
};

class FlexModalWrapper extends React.Component {
  render() {
    const { children, ...other } = this.props;
    const {
      closeOnOutsideClick,
      className,
      useOverlay,
      overlayStyle,
      overlayClassName,
      preventScrolling,
      ...portalOptions
    } = other;

    return (
      <Portal {...portalOptions}>
        <ModalWrapper
          ref={(ref) => this.modal = ref}
          {...{closeOnOutsideClick, className, useOverlay, overlayStyle, overlayClassName, preventScrolling}}
        >
          {children}
        </ModalWrapper>
      </Portal>
    );
  }
}

FlexModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  useOverlay: PropTypes.bool,
  overlayStyle: PropTypes.object,
  overlayClassName: PropTypes.string,
  // Portal props
  isOpened: PropTypes.bool,
  openByClickOn: PropTypes.element,
  closeOnEsc: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  preventScrolling: PropTypes.bool,
  onClose: PropTypes.func
};
FlexModalWrapper.defaultProps = {
  useOverlay: true,
  preventScrolling: true
};

module.exports = FlexModalWrapper;
