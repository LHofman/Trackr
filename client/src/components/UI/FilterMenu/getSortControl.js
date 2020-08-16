import React from 'react';
import { Menu } from 'semantic-ui-react';

import { createLabel } from '../../../utils/stringUtils';

export default (name, currentSort, handleSortChange) => {
  const orders = ['asc', 'desc'];

  return orders.map(order => createControl(name, order, currentSort, handleSortChange));
}

const createControl = (name, order, currentSort, handleSortChange) => (
  <Menu.Item 
    key={`${name}-${order}`}
    name={name}
    value={order}
    active={currentSort.field === name && currentSort.order === order}
    onClick={(event, { name, value }) => handleSortChange(name, value)}>
    {createLabel(name) + ` (${order})`}
  </Menu.Item>
)