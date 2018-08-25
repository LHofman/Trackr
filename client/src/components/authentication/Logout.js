import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class Logout extends Component {
  constructor() {
    super();
    this.state = {
      redirect: undefined
    };
  }

  componentWillMount() {
    localStorage.clear();
    this.setState({redirect: '/'});
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />;

    return null;
  }
}
