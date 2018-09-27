import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';

import fetch from '../../utils/fetch';

class EditGameObjective extends Component {
  constructor() {
    super();
    this.state = {
      id: '',
      backUrl: '',
      index: 0,
      objective: '',
      objectiveError: '',
      redirect: undefined
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillMount() {
    const params = this.props.match.params;
    const title_id = params.titleId;
    this.setState({backUrl: `/items/${title_id}/objectives`});
    this.getGameObjective(params.objectiveId);
  }

  getGameObjective(objective_id) {
    return fetch(`/api/gameObjectives/objective_id/${objective_id}`).then(({_id, index, objective}) => {
      this.setState({id: _id, index, objective});
    }).catch(console.log);
  }

  editObjective(gameObjective) {
    return fetch(`/api/gameObjectives/${this.state.id}`, 'put', true, gameObjective).then(gameObjective => {
      this.setState({redirect: this.state.backUrl});
    }).catch(console.log);
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (!this.state.objective) {
      isError = true;
      errors.objectiveError = 'Objective is required';
    } else {
      errors.objectiveError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;

    const gameObjective = {
      index: this.state.index,
      objective: this.state.objective
    }

    this.editObjective(gameObjective);
  }

  handleInputChange(e) {
    const target = e.target;
    this.setState({[target.name]: target.value});
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    return (
      <div>
        <h1>Add Objective</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field>
            <label>Index</label>
            <input type='number' name='index' value={this.state.index} onChange={this.handleInputChange} />
          </Form.Field>
          <Form.Field>
            <label>Objective</label>
            <input placeholder='Objective' name='objective' onChange={this.handleInputChange} value={this.state.objective}/>
            {
              this.state.objectiveError &&
              <Message error header={this.state.objectiveError} />
            }
          </Form.Field>
          <Button positive floated='left' type='submit'>Submit</Button>
          <Button negative floated='right' as={Link} to={this.state.backUrl}>Cancel</Button>
        </Form>
      </div>
    );
  }
}

export default EditGameObjective;
