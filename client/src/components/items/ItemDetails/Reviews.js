import React, { Component } from 'react';
import { Button, Card, Icon, Modal, Rating } from 'semantic-ui-react';

import MyForm from '../../UI/Form/MyForm';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';

export default class Reviews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allReviews: props.allReviews,
      reviewFormModal: false,
      reviewId: '',
      reviewRating: 0,
      reviewText: ''
    }
  }

  componentWillMount() {
    this.getReviews(this.props.item);
  }

	getReviews(item) {
		fetch(`/api/items/${item._id}/reviews`).then(allReviews => {
			this.setState({ allReviews });
		});
	}

	openReviewModel() {
		this.setState({ reviewFormModal: true });
	}

	closeReviewModel() {
		this.setState({ reviewFormModal: false });
	}

	editReview(review) {
		this.setState({
			reviewId: review._id,
			reviewRating: review.rating,
			reviewText: review.review,
			reviewFormModal: true
		});
	}

	deleteReview(reviewId) {
		let { allReviews } = this.state;
		let { userItem } = this.props;

		const filterFunction = (reviewB) => reviewB._id !== reviewId

		const reviews = userItem.reviews.filter(filterFunction);
		userItem.reviews = reviews;

		allReviews = allReviews.filter(filterFunction);

		this.setState({ allReviews });

		this.props.updateUserItem(userItem);
	}

	updateReview(formComponent) {
		const form = formComponent.state.inputs;

		const reviewId = form.id.value;
		let existingReview = {};
		if (reviewId) {
			existingReview = this.props.userItem.reviews.filter((review) => review._id === reviewId)[0];
		}

		const review = {
			...existingReview,
			rating: form.rating.value,
			review: form.review.value,
			timestamp: new Date()
		};

		const filterFunction = (reviewB) => reviewB._id !== reviewId;

		const reviews = this.state.allReviews.filter(filterFunction);
		reviews.push({
			...review,
			author: getUser().username
		});
		this.setState({ allReviews: reviews });

		const userItem = this.props.userItem;
		userItem.reviews = [ ...(userItem.reviews || []).filter(filterFunction), review ];

		this.closeReviewModel();
    this.props.updateUserItem(userItem);
	}

  render () {
    const allReviews = this.state.allReviews || [];
    const userItem = this.props.userItem || {};

    return (
      <div>
        <h2>
          Reviews
          {
            userItem && 
            <Button style={{ margin: '1em' }} onClick={ this.openReviewModel.bind(this) }>Add new Review</Button>
          }
        </h2>
        <Modal open={ this.state.reviewFormModal }>
          <Modal.Content>
            <MyForm
              title='Add review'
              inputs={{
                id: {
                  type: 'hidden',
                  value: this.state.reviewId
                },
                rating: {
                  type: 'Rating',
                  hideLabel: true,
                  value: this.state.reviewRating
                },
                review: {
                  type: 'TextArea',
                  hideLabel: true,
                  value: this.state.reviewText,
                  validation: {
                    required: true
                  }
                }
              }}
              submit={ this.updateReview.bind(this) }
              cancelCallback={ this.closeReviewModel.bind(this) } />
            <br/><br/>
          </Modal.Content>
        </Modal>
        <Card.Group>
          {
            allReviews.map((review, index) => (
              <Card fluid key={ index }>
                <Card.Content header={
                  <div>
                    <Rating icon='star' rating={ review.rating } maxRating={ 10 } disabled />
                    {
                      review.author === getUser().username &&
                      <div style={{ float: 'right' }}>
                        <Icon name='edit' color='orange' onClick={() => this.editReview(review)} />
                        <Icon name='trash' color='red' onClick={() => this.deleteReview(review._id)} />
                      </div>
                    }
                  </div>
                } />
                <Card.Content description={ review.review } />
                <Card.Content extra>
                  <Icon name='user' />
                  { review.author } - { new Date(review.timestamp).toDateString() }
                </Card.Content>
              </Card>		
            ))
          }
        </Card.Group>
      </div>
    )
  }
}