import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';

export default class FranchiseDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			details: '',
			confirmationAlert: false,
			redirect: undefined
		}

		this.toggleConfirmationAlert = this.toggleConfirmationAlert.bind(this);
	}

  componentWillMount() {
    this.getFranchise();
  }

	getFranchise() {
		const title_id = this.props.match.params.titleId;
		return fetch(`/api/franchises/title_id/${title_id}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({ details })
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
	}

	onDelete() {
		const franchiseId = this.state.details._id;
		return fetch(`/api/franchises/${franchiseId}`, 'delete', true).then(res => 
			this.setState({redirect: '/franchises'})
		);
	}

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
	}

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		


		const details = this.state.details;
		return (
			<div>
				<Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={'/franchises'} />
				<h1>{details.title}</h1>
				<Confirm
					open={this.state.confirmationAlert}
					header={`confirm deletion`}
					content={`Are you sure you want to delete ${details.title}?`}
					onCancel={this.toggleConfirmationAlert}
					onConfirm={this.onDelete.bind(this)}
				/>
				{
					details.description &&
					<div>
						{details.description}
					</div>
				}
				<br/><br/><br/>
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/franchises/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.toggleConfirmationAlert('delete')}>Delete</Button>	
          ]
        }
      </div>
    );
  }
}
