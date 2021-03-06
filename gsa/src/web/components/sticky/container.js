/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/set';

import React from 'react';

import PropTypes from '../../utils/proptypes.js';
import SubscriptionProvider from '../provider/subscriptionprovider.js';

const EVENTS = [
  'resize',
  'scroll',
  'touchstart',
  'touchmove',
  'touchend',
  'pageshow',
  'load',
];

class StickyContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.subscribers = new Set();

    this.notify = this.notify.bind(this);
    this.notification = this.props.notify('sticky.changed');
  }

  componentDidMount() {
    for (const name of EVENTS) {
      // use passive event handlers see
      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
      window.addEventListener(name, this.notify, {passive: true});
    }
  }

  componentWillUnmount() {
    for (const name of EVENTS) {
      window.removeEventListener(name, this.notify);
    }
  }

  notify(event) {
    if (!this.frame_pending) {
      const {currentTarget} = event;

      window.requestAnimationFrame(() => {
        this.frame_pending = false;

        const {top, bottom} = this.container.getBoundingClientRect();

        this.notification({
          distanceFromTop: top,
          distanceFromBottom: bottom,
          eventSource: currentTarget === window ?
            document.body : this.container,
          container: this.container,
        });
      });

      this.frame_pending = true;
    }
  }

  render() {
    const {notify, ...props} = this.props;
    return (
      <div
        {...props}
        ref={ref => this.container = ref}
        onScroll={this.notify}
        onTouchStart={this.notify}
        onTouchMove={this.notify}
        onTouchEnd={this.notify}
      >
      </div>
    );
  }

}

StickyContainer.propTypes = {
  notify: PropTypes.func.isRequired,
};

export default props => (
  <SubscriptionProvider>
    {({notify}) => (
      <StickyContainer
        {...props}
        notify={notify}
      />
    )}
  </SubscriptionProvider>
);

// vim: set ts=2 sw=2 tw=80:
