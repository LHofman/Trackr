import getInput from "./getInput";

export default (formComponent, handleValueChange) => Object.keys(formComponent.state.inputs).map((field, index) => getInput(
  field,
  { ...formComponent.state.inputs[field], key: index },
  formComponent,
  handleValueChange
));