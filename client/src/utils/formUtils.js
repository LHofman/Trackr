import { updateNestedValue } from "./objectUtils";

export const addItemToSelect = (stateKey, field, parentFormComponent) => (newItem, myFormComponent) => {
  const allItems = [{ text: newItem, value: newItem }, ...parentFormComponent.state[stateKey]];
  parentFormComponent.setState({ [stateKey]: allItems });
  
  let itemsField = myFormComponent.state.inputs[field];
  itemsField.options = allItems;
  itemsField.value = [ ...itemsField.value, newItem ];
  
  const updatedForm = updateNestedValue(myFormComponent.state.inputs, `${field}.options`, allItems);
  myFormComponent.setState({ inputs: updatedForm });
}