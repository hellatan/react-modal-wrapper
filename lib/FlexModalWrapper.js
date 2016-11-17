import React from 'react';
import { findDOMNode } from 'react-dom';
import Portal from '@1stdibs/react-portal';
import css from './FlexModalWrapper.css';

class ModalWrapper extends React.Component {
  constructor() {
    super();
    this.handleMouseClickOutside = this.handleMouseClickOutside.bind(this);
  }

  componentDidMount() {
    if (!document) {
      return;
    }
    if (this.props.closeOnOutsideClick) {
      document.addEventListener('mousedown', this.handleMouseClickOutside);
    }
    if (this.props.preventScrolling) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  componentWillUnmount() {
    if (!document) {
      return;
    }
    document.removeEventListener('mousedown', this.handleMouseClickOutside);
    if (this.props.preventScrolling) {
      document.body.style.overflow = this.previousOverflow;
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
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.string,
  useOverlay: React.PropTypes.bool,
  overlayStyle: React.PropTypes.object,
  overlayClassName: React.PropTypes.string,
  closeOnOutsideClick: React.PropTypes.bool,
  preventScrolling: React.PropTypes.bool,
  // passed by Portal
  closePortal: React.PropTypes.func
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
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.string,
  useOverlay: React.PropTypes.bool,
  overlayStyle: React.PropTypes.object,
  overlayClassName: React.PropTypes.string,
  // Portal props
  isOpened: React.PropTypes.bool,
  openByClickOn: React.PropTypes.element,
  closeOnEsc: React.PropTypes.bool,
  closeOnOutsideClick: React.PropTypes.bool,
  preventScrolling: React.PropTypes.bool,
  onClose: React.PropTypes.func
};
FlexModalWrapper.defaultProps = {
  useOverlay: true,
  preventScrolling: true
};

module.exports = FlexModalWrapper;
