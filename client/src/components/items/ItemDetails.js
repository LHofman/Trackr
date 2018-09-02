import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getIcon from '../../utils/getIcon';

export default class ItemDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			details: '',
			deleteConfirmationAlert: false,
			redirect: undefined
		}
	}

  componentWillMount() {
    this.getItem();
  }

	getItem() {
		const title_id = this.props.match.params.titleId;
		return fetch(`/api/items/title_id/${title_id}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({ details })
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
	}

  showConfirmationAlert() {
    this.setState({ deleteConfirmationAlert: true });
  }

	hideConfirmationAlert() {
		this.setState({ deleteConfirmationAlert: false });
	}

	onDelete() {
		const itemId = this.state.details._id;
		return fetch(`/api/items/${itemId}`, 'delete', true).then(res => 
			this.setState({redirect: '/'})
		);
	}

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		


		const details = this.state.details;
		return (
			<div>
				<Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={'/'} />
				<h1>
					{getIcon(details)}
					{details.title}
				</h1>
				<Confirm
					open={this.state.deleteConfirmationAlert}
					header={`confirm delete`}
					content={`Are you sure you want to delete ${details.title}?`}
					onCancel={this.hideConfirmationAlert.bind(this)}
					onConfirm={this.onDelete.bind(this)}
				/>
				{
					details.type === 'Book' &&
					<h3>Author: {details.author}</h3>
				}
				{
					details.type === 'TvShow' &&
					<h3>{details.ongoing ? 'Ongoing' : 'Ended'}</h3>
				}
				<h3>Release Date: {new Date(details.releaseDate).toDateString()}</h3><br />
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/items/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert()}>Delete</Button>	
          ]
        }
      </div>
    );
  }
}
