import PandaBridge from 'pandasuite-bridge';

import debounce from 'lodash/debounce';

let properties = null;

const validationState = {
  validated: false,
  isValid: false,
  isEmpty: true,
};

function getQueryable() {
  return {
    inputValue: document.getElementById('text').value,
    validation: validationState,
  };
}

function validate() {
  const textEl = document.getElementById('text');
  const inputValue = textEl.value;

  validationState.validated = true;
  validationState.isEmpty = inputValue === '';

  if (textEl.type === 'email') {
    validationState.isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
  } else if (textEl.type === 'number') {
    validationState.isValid = !validationState.isEmpty && !isNaN(inputValue);
  } else if (textEl.type === 'tel') {
    validationState.isValid = /^\+?\d+$/.test(inputValue);
  } else if (textEl.type === 'url') {
    validationState.isValid =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(:\d+)?(\/[\/\w \.-]*)*\/?(\?[^\s]*)?(#[^\s]*)?$/.test(
        inputValue,
      );
  } else if (textEl.type === 'date') {
    validationState.isValid = !isNaN(Date.parse(inputValue));
  } else if (textEl.type === 'time') {
    validationState.isValid = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
      inputValue,
    );
  } else {
    validationState.isValid = true;
  }

  const queryable = getQueryable();

  PandaBridge.send(PandaBridge.UPDATED, { queryable });
  PandaBridge.send('onValidated', [queryable]);
}

function focused() {
  const queryable = getQueryable();
  PandaBridge.send('onFocused', [queryable]);
}

function getTextEl() {
  const inputType = properties.type === 'textarea' ? 'textarea' : 'input';
  let textEl = document.getElementById('text');

  if (!textEl || textEl.type !== inputType) {
    const newEl = document.createElement(inputType);
    newEl.id = 'text';
    newEl.value = textEl ? textEl.value : '';
    if (textEl) {
      textEl.parentNode.replaceChild(newEl, textEl);
    } else {
      document.getElementById('container').appendChild(newEl);
    }
    textEl = newEl;
  }
  return textEl;
}

function myInit() {
  const textEl = getTextEl();

  if (properties && properties.debounce) {
    textEl.oninput = debounce(() => {
      validate();
    }, properties.debounceTime || 300);
  }
  textEl.onfocus = focused;
  textEl.style.fontSize = `${properties.textSize}px`;
  textEl.style.textAlign = properties.textAlign;
  textEl.style.color = properties.textColor;
  if (properties.type) {
    textEl.type = properties.type;
  }
  if (properties.placeholder) {
    textEl.placeholder = properties.placeholder;
  }
  if (properties.content) {
    textEl.value = properties.content;
  }
}

PandaBridge.init(() => {
  PandaBridge.onLoad((pandaData) => {
    properties = pandaData.properties;
    myInit();
  });

  PandaBridge.onUpdate((pandaData) => {
    properties = pandaData.properties;
    myInit();
  });

  PandaBridge.listen('validate', () => {
    validate();
  });

  PandaBridge.listen('setText', ([props]) => {
    const { text } = props || {};

    document.getElementById('text').value = text || '';
  });

  PandaBridge.listen('clearText', () => {
    document.getElementById('text').value = '';
  });

  PandaBridge.listen('focusText', () => {
    document.getElementById('text').focus();
  });
});
