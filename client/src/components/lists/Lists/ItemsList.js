import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

import getOnClickAttributes from '../../../utils/getOnClickAttributes';

export default class ItemsList extends Component {
  render() {
    const { list } = this.props;
    
    const onClickAttributes = getOnClickAttributes(`/lists/${list.title_id}`, this.props, list);

    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <a { ...onClickAttributes }>{list.title}</a>
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
