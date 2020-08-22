import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

export default class User extends Component {
  onHeaderClick() {
    this.props.onClickCallback(this.props.user);
  }
  
  render() {
    const user = this.props.user;

    let onClickAttributes = { href: `/adminUsers/${user.username}` };
    if (this.props.onClickCallback) {
      onClickAttributes = { onClick: this.onHeaderClick.bind(this) };
    }

    return (
      <List.Item>
        <List.Header as='a' { ...onClickAttributes }>{user.username}</List.Header>
        <List.Content>{ user.firstName } { user.name }</List.Content>
      </List.Item>
    );
  }
}