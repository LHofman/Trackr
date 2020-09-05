import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

export default class ItemsList extends Component {
  onHeaderClick() {
    this.props.onClickCallback(this.props.list);
  }
  
  render() {
    const { list } = this.props;
    
    let onClickAttributes = { href: `/lists/${list.title_id}` };
    if (this.props.onClickCallback) {
      onClickAttributes = { onClick: this.onHeaderClick.bind(this) };
    }

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
