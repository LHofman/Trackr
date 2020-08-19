export const updateNestedValue = (obj, keyPath, value) => {
  const pathArray = Array.isArray(keyPath) ? keyPath : keyPath.split('.');

  const currentKey = pathArray[0];

  if (pathArray.length === 1) {
    return updateObjectValue(obj, currentKey, value);
  }
  
  return updateObjectValue(obj, currentKey, updateNestedValue(obj[currentKey], pathArray.slice(1), value));
}

export const updateObjectValue = (obj, key, value) => { return { ...obj, [key]: value } };

export const getNestedValue = (obj, keyPath) => keyPath.split('.').reduce((prev, curr) => prev && prev[curr], obj);

export const getValue = (objectValue, ...functionParams) => {
  //If value is a function, return the result of that function
  if ({}.toString.call(objectValue) === '[object Function]') {
    return objectValue(...functionParams);
  }
  return objectValue;
}