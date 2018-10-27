import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message, TextArea } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';

export default class EditFranchise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      details: {},
      id: '',
      title: '',
      titleError: '',
      description: undefined,
      redirect: undefined
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentWillMount() {
    this.getFranchiseDetails();
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (!this.state.title) {
      isError = true;
      errors.titleError = 'Title is required';
    } else {
      errors.titleError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  editFranchise(newFranchise) {
    const franchiseId = this.state.id;
    return fetch(`/api/franchises/${franchiseId}`, 'put', true, newFranchise).then(franchise => {
        this.setState({redirect: `/franchises/${franchise.title_id}`});
      }).catch(console.log);
  }

  getFranchiseDetails() {
    const title_id = this.props.match.params.titleId;
    return fetch(`/api/franchises/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({
            details,
            id: details._id,
            title: details.title,
            description: details.description,
          });
        } else this.setState({ redirect: `/franchises/${title_id}` });
			}).catch(reason => 
				this.setState({redirect: '/'})
			);
  }

  handleInputChange(e) {
    const target = e.target;
    this.handleValueChange(target.name, target.value);
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;
    const { title, description } = this.state;
    const newFranchise = {
      title,
      description
    }
    this.editFranchise(newFranchise);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />



    return (
      <div>
        <h1>Edit Franchise</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field required>
            <label>Title</label>
            <input placeholder='Title' name='title' value={this.state.title} onChange={this.handleInputChange} />
            {
							this.state.titleError && 
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <TextArea autoHeight placeholder='Description' name='description' value={this.state.description} onChange={this.handleInputChange} />
          </Form.Field>
          <Button positive floated='left' type='submit'>Save Franchise</Button>
          <Button negative floated='right' as={Link} to={`/franchises/${this.state.id}`}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
