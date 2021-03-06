/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import logger from 'gmp/log.js';
import {is_defined, is_array, exclude_object_props} from 'gmp/utils';

import PromiseFactory from 'gmp/promise.js';
import CancelToken from 'gmp/cancel.js';

import Filter from 'gmp/models/filter.js';

import compose from '../utils/compose.js';
import PropTypes from '../utils/proptypes.js';

import SelectionType from '../utils/selectiontype.js';

import withCache from '../utils/withCache.js';
import withGmp from '../utils/withGmp.js';

import withDownload from '../components/form/withDownload.js';

import Wrapper from '../components/layout/wrapper.js';

import withDialogNotification from '../components/notification/withDialogNotifiaction.js'; // eslint-disable-line max-len

import SortBy from '../components/sortby/sortby.js';

import TagsDialog from './tagsdialog.js';

const log = logger.getLogger('web.entities.container');

const exclude_props = [
  // these props are consumed here and must not be passed to the children
  'children',
  'component',
  'gmpname',
  'onDownload',
];

class EntitiesContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      loading: false,
      updating: false,
      selection_type: SelectionType.SELECTION_PAGE_CONTENTS,
      tags: [],
      tagsDialogVisible: false,
    };

    const {gmpname, gmp, notify} = this.props;

    let entities_command_name;

    if (is_array(gmpname)) {
      this.name = gmpname[0];
      entities_command_name = gmpname[1];
    }
    else {
      this.name = gmpname;
      entities_command_name = gmpname + 's';
    }

    this.entities_command = gmp[entities_command_name];

    this.notifyTimer = notify(`${entities_command_name}.timer`);
    this.notifyChanged = notify(`${entities_command_name}.changed`);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleDeselected = this.handleDeselected.bind(this);
    this.handleDeleteBulk = this.handleDeleteBulk.bind(this);
    this.handleDownloadBulk = this.handleDownloadBulk.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleSelectionTypeChange = this.handleSelectionTypeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.handleFilterReset = this.handleFilterReset.bind(this);
    this.openTagsDialog = this.openTagsDialog.bind(this);
    this.closeTagsDialog = this.closeTagsDialog.bind(this);
  }

  componentDidMount() {
    const {filter} = this.props.location.query;
    this.updateFilter(filter, true); // use data from cache and reload afterwards
  }

  componentWillUnmount() {
    this.cancelLoading();
  }

  componentWillReceiveProps(next) {
    if (is_defined(next.location) && is_defined(next.location.query) &&
      next.location.query.filter !== this.props.location.query.filter) {
      const {filter} = next.location.query;
      this.updateFilter(filter);
    }
  }

  updateFilter(filterstring, reload = false) {
    const filter = is_defined(filterstring) ? Filter.fromString(filterstring) :
      undefined;

    this.load({filter, reload});
  }

  load(options = {}) {
    const {entities_command} = this;
    const {filter, force = false, reload = false} = options;
    const {cache, extraLoadParams = {}} = this.props;
    const {loaded_filter} = this.state;

    this.cancelLoading();

    if (is_defined(loaded_filter) &&
      is_defined(filter) && !loaded_filter.equals(filter)) {
      this.setState({
        loading: true,
        updating: true,
      });
    }
    else {
      this.setState({loading: true});
    }

    const token = new CancelToken(cancel => this.cancel = cancel);

    log.debug('Loading', options);

    entities_command.get({filter, ...extraLoadParams}, {
      cache,
      cancel_token: token,
      force,
    })
      .then(response => {
        const {data: entities, meta} = response;
        const {filter: loaded_filter, counts: entities_counts} = meta; // eslint-disable-line no-shadow

        const entitiesType = entities.length > 0 ?
          entities[0].entity_type : undefined;

        this.cancel = undefined;

        let refresh = false;

        const reverse_field = loaded_filter.get('sort-reverse');
        const reverse = is_defined(reverse_field);
        const field = reverse ? reverse_field : loaded_filter.get('sort');

        log.debug('Loaded entities', response);

        this.setState({
          entities,
          entities_counts,
          entitiesType,
          filter,
          loaded_filter,
          loading: false,
          sortBy: field,
          sortDir: reverse ? SortBy.DESC : SortBy.ASC,
          updating: false,
        });

        if (meta.fromcache && (meta.dirty || reload)) {
          log.debug('Forcing reload of entities', meta.dirty, reload);
          refresh = true;
        }

        this.startTimer(refresh);
      }, error => {
        if (is_defined(error.isCancel) && error.isCancel()) {
          return;
        }
        this.setState({loading: false});
        this.handleError(error);
        return PromiseFactory.reject(error);
      });
  }

  reload({invalidate = false} = {}) {
    if (invalidate) {
      const {cache} = this.props;
      log.debug('Marking cache as dirty', cache);
      cache.invalidate();
    }
    // reload data from backend
    this.load({filter: this.state.loaded_filter, force: true});
  }

  getRefreshInterval() {
    const {gmp} = this.props;
    return gmp.autorefresh * 1000;
  }

  startTimer(immediate = false) {
    const refresh = immediate ? 0 : this.getRefreshInterval();
    if (refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        refresh, 'milliseconds');
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
    this.notifyTimer();
  }

  cancelLastRequest() {
    if (is_defined(this.cancel)) {
      this.cancel();
    }
  }

  cancelLoading() {
    this.cancelLastRequest();
    this.clearTimer(); // remove possible running timer
  }

  handleChanged() {
    this.reload();
    this.notifyChanged();
  }

  handleSelectionTypeChange(selection_type) {
    let selected;

    if (selection_type === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = undefined;
    }

    this.setState({selection_type, selected});
  }

  handleDownloadBulk(filename = 'export.xml') {
    const {entities_command} = this;
    const {selected, selection_type, loaded_filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entities_command.exportByFilter(loaded_filter);
    }
    else {
      promise = entities_command.exportByFilter(loaded_filter.all());
    }

    promise.then(response => {
      const {data} = response;
      const {onDownload} = this.props;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleDeleteBulk() {
    const {entities_command} = this;
    const {selected, selection_type, loaded_filter} = this.state;
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = entities_command.delete(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entities_command.deleteByFilter(loaded_filter);
    }
    else {
      promise = entities_command.deleteByFilter(loaded_filter.all());
    }

    promise.then(deleted => {
      this.reload({invalidate: true});
      log.debug('successfully deleted entities', deleted);
    }, this.handleError);
  }

  handleSelected(entity) {
    const {selected} = this.state;

    selected.add(entity);

    this.setState({selected});
  }

  handleDeselected(entity) {
    const {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});
  }

  handleSortChange(field) {
    const {loaded_filter} = this.state;

    let sort = 'sort';
    const sort_field = loaded_filter.getSortBy();

    const filter = loaded_filter.first();

    if (sort_field && sort_field === field) {
      sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
    }

    filter.set(sort, field);

    this.load({filter});
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  handleFirst() {
    const {loaded_filter: filter} = this.state;

    this.load({filter: filter.first()});
  }

  handleNext() {
    const {loaded_filter: filter} = this.state;

    this.load({filter: filter.next()});
  }

  handlePrevious() {
    const {loaded_filter: filter} = this.state;

    this.load({filter: filter.previous()});
  }

  handleLast() {
    const {loaded_filter: filter, entities_counts: counts} = this.state;

    const last = Math.floor((counts.filtered - 1) / counts.rows) *
      counts.rows + 1;

    this.load({filter: filter.first(last)});
  }

  handleFilterCreated(filter) {
    this.load({filter});
  }

  handleFilterChanged(filter) {
    this.load({filter});
  }

  handleFilterReset() {
    const {router, location} = this.props;
    const query = {...location.query};

    // remove filter param from url
    delete query.filter;

    router.push({pathname: location.pathname, query});

    this.load();
  }

  openTagsDialog() {
    this.getTagsByType();
    this.setState({tagsDialogVisible: true});
  }

  closeTagsDialog() {
    this.setState({tagsDialogVisible: false});
  }

  getTagsByType() {
    const {gmp} = this.props;
    const {entitiesType} = this.state;
    const filter = 'resource_type=' + entitiesType;
    gmp.tags.getAll({filter})
      .then(response => {
        const {data} = response;
        this.setState({tags: data});
      });
  }

  render() {
    const {
      entities,
      entities_counts,
      loaded_filter,
      loading,
      selected = {},
      selection_type,
      sortBy,
      sortDir,
      tags,
      tagsDialogVisible,
      updating,
    } = this.state;
    const {
      onDownload,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;

    let entitiesType;
    if (is_defined(entities) && is_defined(entities[0])) {
      entitiesType = entities[0].entity_type;
    }

    let title;
    if (selection_type === SelectionType.SELECTION_USER) {
      title = 'Add Tag to Selection';
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = 'Add Tag to Page Contents';
    }
    else {
      title = 'Add Tag to All Filtered';
    }
    const Component = this.props.component;
    const other = exclude_object_props(this.props, exclude_props);
    return (
      <Wrapper>
        <Component
          createFilterType={this.name}
          {...other}
          loading={loading}
          entities={entities}
          entitiesCounts={entities_counts}
          entitiesSelected={selected}
          filter={loaded_filter}
          selectionType={selection_type}
          sortBy={sortBy}
          sortDir={sortDir}
          onChanged={this.handleChanged}
          onDownloaded={onDownload}
          onError={this.handleError}
          onFilterChanged={this.handleFilterChanged}
          onFilterReset={this.handleFilterReset}
          onSortChange={this.handleSortChange}
          onSelectionTypeChange={this.handleSelectionTypeChange}
          onDownloadBulk={this.handleDownloadBulk}
          onDeleteBulk={this.handleDeleteBulk}
          onTagsBulk={this.openTagsDialog}
          onEntitySelected={this.handleSelected}
          onEntityDeselected={this.handleDeselected}
          onFilterCreated={this.handleFilterCreated}
          onFirstClick={this.handleFirst}
          onLastClick={this.handleLast}
          onNextClick={this.handleNext}
          onPreviousClick={this.handlePrevious}
          showError={showErrorMessage}
          showSuccess={showSuccessMessage}
          updating={updating}
        />
        {tagsDialogVisible &&
          <TagsDialog
            filter={loaded_filter}
            tags={tags}
            title={title}
            resources={selected}
            resourceType={entitiesType}
            selectionType={selection_type}
            onClose={this.closeTagsDialog}
          />
        }
      </Wrapper>
    );
  }

}

EntitiesContainer.propTypes = {
  cache: PropTypes.cache.isRequired,
  component: PropTypes.component.isRequired,
  entities: PropTypes.array,
  extraLoadParams: PropTypes.object,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  gmpname: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  notify: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

EntitiesContainer = compose(
  withGmp,
  withCache(),
  withDialogNotification,
  withDownload,
)(EntitiesContainer);

export default EntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
