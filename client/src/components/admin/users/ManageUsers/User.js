import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

export default class User extends Component {
  render() {
    const user = this.props.user;

    return (
      <List.Item>
        <List.Header>
          <Link to={`${this.props.match}/${user.username}`}>{user.username}</Link>
        </List.Header>
        <List.Content>{ user.firstName } { user.name }</List.Content>
      </List.Item>
    );
  }
}