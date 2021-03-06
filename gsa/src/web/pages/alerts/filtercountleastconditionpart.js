/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';
import withPrefix from '../../utils/withPrefix.js';

import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import Radio from '../../components/form/radio.js';

const VALUE = 'Filter count at least';

const FilterCountLeastConditionPart = ({
    condition,
    atLeastFilterId,
    atLeastCount,
    filters,
    prefix,
    onChange,
  }) => {
  return (
    <Divider>
      <Radio
        title={_('Filter')}
        value={VALUE}
        name="condition"
        checked={condition === VALUE}
        onChange={onChange}>
      </Radio>
      <Select
        value={atLeastFilterId}
        name={prefix + 'at_least_filter_id'}
        onChange={onChange}>
        {render_options(filters)}
      </Select>
      <Layout>
        {_('matches at least')}
      </Layout>
      <Spinner
        value={atLeastCount}
        name={prefix + 'at_least_count'}
        type="int"
        min="0"
        size="5"
        onChange={onChange}/>
      <Layout flex box>
        {_('result(s) NVT(s)')}
      </Layout>
    </Divider>
  );
};

FilterCountLeastConditionPart.propTypes = {
  atLeastCount: PropTypes.number.isRequired,
  atLeastFilterId: PropTypes.id,
  condition: PropTypes.string.isRequired,
  filters: PropTypes.array.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(FilterCountLeastConditionPart);

// vim: set ts=2 sw=2 tw=80:
