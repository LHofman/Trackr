import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';

export default class ListDetails extends Component {
  constructor() {
    super();
    this.state = {
			confirmationAlert: false,
      redirect: undefined,
      list: {}
		}
		
		this.toggleConfirmationAlert = this.toggleConfirmationAlert.bind(this);
  }

  componentWillMount() {
    this.getListDetails(this.props);
	}
	
	componentWillReceiveProps(props) {
		this.getListDetails(props);
	}

	getListDetails(props) {
		let titleId = '';
		if (props.list) {
			titleId = props.list.title_id;
		} else if (props.match) {
			titleId = props.match.params.titleId;
		} else {
			this.setState({ redirect: '/' });
			return;
		}

		return fetch(`/api/lists/title_id/${titleId}`).then(list => {
			if (!list || list === null) throw new Error('List not found');
			this.setState({ list });
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
		const listId = this.state.list._id;
		return fetch(`/api/lists/${listId}`, 'delete', true).then(res => {
      if (this.props.onBackCallback) {
        this.props.deleteList(this.state.list);
      } else {
        this.setState({ redirect: '/lists' })
      }
    }).catch(console.log);
	}

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
  }
  
  render() {
    const { redirect, list } = this.state;

    if (redirect) return <Redirect to={ redirect } />;

		let backButtonAttributes = { as: Link, to: '/lists' };
		if (this.props.onBackCallback) {
			backButtonAttributes = { onClick: () => this.props.onBackCallback() };
		}

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' { ...backButtonAttributes } />
        <h1>{list.title}</h1>
        <h3>{list.description}</h3>
        <Confirm
					open={ this.state.confirmationAlert }
					header='confirm action'
					content='Are you sure you want to delete this list?'
					onCancel={ this.hideConfirmationAlert.bind(this) }
					onConfirm={ this.confirmDelete.bind(this) } />
        {
          canEdit(list) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/lists/${list.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.toggleConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
      </div>
    );
  }
}