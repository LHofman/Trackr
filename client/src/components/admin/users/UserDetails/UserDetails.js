import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import BackButton from '../../../UI/Basic/Button/BackButton';

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
			if (this.props.deleteUser) this.props.deleteUser(this.state.user);
			this.setState({ redirect: this.props.match })
		}).catch(console.log);
	}

  render() {
    const { 
			props: { isSideComponent },
			state: { redirect, user }
		 } = this;

    if (redirect) return <Redirect to={ redirect } />;

    return (
      <div>
				{ !isSideComponent && <BackButton {...this.props} /> }
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