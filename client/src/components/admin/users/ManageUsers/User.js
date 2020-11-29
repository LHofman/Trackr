import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

import getOnClickAttributes from '../../../../utils/getOnClickAttributes';

export default class User extends Component {
  render() {
    const user = this.props.user;

    const onClickAttributes = getOnClickAttributes(`/adminUsers/${user.username}`, this.props, user);

    return (
      <List.Item>
        <List.Header>
          <a {...onClickAttributes}>{user.username}</a>
        </List.Header>
        <List.Content>{ user.firstName } { user.name }</List.Content>
      </List.Item>
    );
  }
}