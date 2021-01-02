import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import fetch from '../../../../utils/fetch';

export default class UserDetails extends Component {
  constructor() {
    super();
    this.state = {
			confirmationAlert: false,
      redirect: undefined,
      user: {}
    }
  }

  componentWillMount() {
		this.getUser(this.props);
	}
	
	componentWillReceiveProps(props) {
		this.getUser(props);
	}

	getUser(props) {
		let username = '';
		if (props.user) {
			username = props.user.username;
		} else if (props.match) {
			username = props.match.params.username;
		} else {
			this.setState({ redirect: '/' });
			return;
		}

		return fetch(`/api/users/byUsername/${username}`).then(user => {
			if (!user || user === null) throw new Error('User not found');
			this.setState({ user });
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
	}

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

	hideConfirmationAlert() {
		this.setState({ confirmationAlert: false });
	}

	confirmDelete() {
		const userId = this.state.user._id;
		return fetch(`/api/users/${userId}`, 'delete', true).then(res => {
      if (this.props.onBackCallback) {
        this.props.deleteUser(this.state.user);
      } else {
        this.setState({ redirect: '/adminUsers' })
      }
    }).catch(console.log);
	}

  render() {
    const { redirect, user } = this.state;

    if (redirect) return <Redirect to={ redirect } />;

		let backButtonAttributes = { as: Link, to: '/adminUsers' };
		if (this.props.onBackCallback) {
			backButtonAttributes = { onClick: () => this.props.onBackCallback() };
		}

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' { ...backButtonAttributes } />
        <h1>{ user.username }</h1>
        <h3>{ user.firstName } { user.name }</h3>
        <h3>Email: { user.email }</h3>
        <Confirm
					open={ this.state.confirmationAlert }
					header='confirm action'
					content='Are you sure you want to delete this user?'
					onCancel={ this.hideConfirmationAlert.bind(this) }
					onConfirm={ this.confirmDelete.bind(this) } />
        <Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert('delete')}>Delete</Button>
      </div>
    );
  }
}