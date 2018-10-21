import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Confirm, Dropdown, Header, Icon, Modal, Popup, Rating } from 'semantic-ui-react';

import extendedEquals from '../../utils/extendedEquals';
import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getIcon from '../../utils/getIcon';
import getUser from '../../utils/getUser';
import hasStarted from '../../utils/hasStarted';
import isLoggedIn from '../../utils/isLoggedIn';
import statusOptions from '../userItems/statusOptions';
import getArtistType from './getArtistType';

export default class ItemDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			details: '',
			confirmationAlert: '',
			userItem: '',
			modalOpen: false,
			redirect: undefined
		}

		this.updateUserItem = this.updateUserItem.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
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
		}).then(() => this.getUserItem());
	}

	getUserItem() {
		if (!isLoggedIn()) return;
		fetch(`/api/userItems/${getUser().id}/${this.state.details._id}`).then(userItem => {
			if (!userItem || userItem === null) throw new Error('userItem not found');
			this.setState({userItem});
		}).catch(console.log);
	}

  followItem(e) {
    e.preventDefault();
		return fetch(`/api/userItems`, 'post', true, 
			{ 
				user: getUser().id, 
				item: this.state.details._id,
				status: statusOptions(this.state.details)[0].value
			}
		).then(userItem => this.setState({ userItem }))
		.catch(console.log);
  }

  unfollowItem() {
    return fetch(`/api/userItems/${this.state.userItem._id}`, 'delete', true).then(userItem => {
			this.setState({ userItem: ''});
			this.hideConfirmationAlert();
    }).catch(console.log);
  }

  showConfirmationAlert(alert) {
    this.setState({ confirmationAlert: alert });
  }

	hideConfirmationAlert() {
		this.setState({ confirmationAlert: '' });
	}

	confirmAlert() {
		switch (this.state.confirmationAlert) {
			case 'delete': this.onDelete(); break;
			case 'unfollow': this.unfollowItem(); break;
			default: break;
		}
	}

	onDelete() {
		const itemId = this.state.details._id;
		return fetch(`/api/items/${itemId}`, 'delete', true).then(res => 
			this.setState({redirect: '/'})
		);
	}

  updateUserItem(name, value) {
		const userItem = this.state.userItem;
    if (userItem[name] === value) return;
    userItem[name] = value;
		fetch(`/api/userItems/${userItem._id}`, 'put', true, userItem)
			.catch(res => {
				res.json().then(body => {
					console.log(body);
				});
			});
    this.setState({ userItem, modalOpen: true });
	}
	
	closeModal() {
		this.setState({ modalOpen: false })
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
					{
						isLoggedIn() &&
						(
							this.state.userItem ?
							<Popup
								trigger={<Icon id='unfollow' name='minus' color='red' onClick={() => this.showConfirmationAlert('unfollow')} />}
								content='Unfollow this item'
							/> :
							<Popup
								trigger={<Icon id='follow' name='plus' color='green' onClick={this.followItem.bind(this)} />}
								content='Follow this item'
							/>
						)
					}
				</h1>
				<Confirm
					open={this.state.confirmationAlert !== ''}
					header={`confirm action`}
					content={`Are you sure you want to ${this.state.confirmationAlert} ${details.title}?`}
					onCancel={this.hideConfirmationAlert.bind(this)}
					onConfirm={this.confirmAlert.bind(this)}
				/>
				{
					extendedEquals(details.type, 'Album', 'Book') &&
					<h3>{ getArtistType(details.type) }: {details.artist}</h3>
				}
				{
					details.type === 'TvShow' &&
					<h3>{hasStarted(details.releaseDateStatus, details.releaseDate) ? (details.ongoing ? 'Ongoing' : 'Ended') : 'Upcoming'}</h3>
				}
				<h3>
					Release Date: {
						details.releaseDateStatus === 'Date' ? 
						new Date(details.releaseDate).toDateString() : 
						details.releaseDateStatus
					}
				</h3>
				{
					details.type === 'Video Game' &&
					<div><Button as={Link} to={`/objectives/${details.title_id}`} color='teal'>Objectives</Button><br /><br /></div>
				}
				{
					details.description &&
					<div>
						{details.description}
						<br/><br/><br/>
					</div>
				}
				{
					this.state.userItem &&
					<div>
						<Checkbox key='inCollection' label='In Collection' name='inCollection' checked={this.state.userItem.inCollection}
							onChange={(param, data) => this.updateUserItem('inCollection', data.checked)} /><br /><br />
						<Rating icon='star' defaultRating={this.state.userItem.rating} maxRating={10} clearable onRate={(param, data) => this.updateUserItem('rating', data.rating)} /><br/><br/>
						<Dropdown key='status' placeholder='Status' selection options={statusOptions(details)} name='status' value={this.state.userItem.status} 
							onChange={(param, data) => this.updateUserItem('status', data.value)} /><br /><br />
						<Modal key='message'
							open={this.state.modalOpen}
							onClose={this.closeModal}
							basic
							size='small'>
							<Header icon='browser' content='Item updated' />
							<Modal.Actions>
								<Button color='green' onClick={this.closeModal} inverted>
									<Icon name='checkmark' /> Got it
          			</Button>
              </Modal.Actions>
            </Modal>
          </div>
        }
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/items/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert('delete')}>Delete</Button>	
          ]
        }
      </div>
    );
  }
}
