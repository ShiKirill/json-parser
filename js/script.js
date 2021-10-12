const fileInput = document.getElementById('file-input');
const showFileWindow = document.querySelector('.open');
const fileBlockText = document.querySelector('.file-block-text');
const clearBtn = document.querySelector('.clear');
let json;

const body = document.querySelector('body');
const wrapper = document.querySelector('.wrapper');
let enterTarget;

const showResultBlock = document.querySelector('.show-result-block');

showFileWindow.addEventListener('click', () => {
  fileInput.click();
});

const setTitle = (str) => {
  if (!str) return str;
  if (str.indexOf('_') !== -1) {
    str = str.replace(/_/g, ' ');
  }
  return str[0].toUpperCase() + str.slice(1);
};

const setMask = (input, maskVal) => {
  // function mask(event) {
  //   const keyCode = event.keyCode;
  //   const template = maskVal;
  //   console.log('keyCode: ', keyCode);
  //   console.log('template:', template);
  // }
  let tmpStr = '';
  let iterator = 0;
  for (let i =0; i< maskVal.length; i++){
    if (!/[0-9]/.test(maskVal[i])){
      if (i>0 && /[0-9]/.test(tmpStr[i])){
        tmpStr += '{' + iterator + '}';
        iterator = 0;
      }
      tmpStr += maskVal[i];
    } else {
      tmpStr += maskVal[i];
      iterator++;
    }
  }
  
  
  input.setAttribute('pattern', tmpStr);
  input.setAttribute('placeholder', tmpStr);
  input.addEventListener('input', ()=>{
    console.log(input.value);
    console.log(input.value.length);
  });

  return input;
};

const fillByContent = (mainBlock, fields) => {
  let i = 0;
  fields.forEach(item => {
    const fieldBlock = document.createElement('div');
    fieldBlock.classList.add('field-block');

    if (item.label) {
      const label = document.createElement('label');
      label.textContent = item.label;
      label.setAttribute('for', 'field' + i)
      fieldBlock.appendChild(label);
    }


    const dataList = document.createElement('datalist');
    const inputAttributes = item.input;
    let input = document.createElement('input');
    for (let key in inputAttributes) {
      if (key == 'mask') {

        input = setMask(input, inputAttributes[key]);
      } else if (key == 'filetype') {
        let tempStr = '';
        inputAttributes[key].forEach((item, index )=> {
          if (index == 0){
            tempStr = '.' + item;
          } else {
            tempStr = tempStr + ', .' +  item; 
          }
        });
        input.setAttribute('accept', tempStr);
      } else {
        if (inputAttributes[key] !== 'false') {
          if (inputAttributes[key] == 'textarea') {
            input = document.createElement('textarea');
          } else {
            if (key == 'colors' || key == 'technologies') {
              input.setAttribute('list', key);
              dataList.setAttribute('id', key);
              inputAttributes[key].forEach(item => {
                const option = document.createElement('option');
                option.innerText = item;
                dataList.appendChild(option);
              });
              tempField = dataList;
            } else {
              input.setAttribute(key, inputAttributes[key]);
            }
          }
        }
      }

    }
    input.setAttribute('id', 'field' + i);
    if (input.getAttribute('type') !== 'color' && input.getAttribute('type') !== 'file') {
      input.classList.add('form-input');
    } else {
      input.style.cursor = 'pointer';
    }
    fieldBlock.appendChild(input);
    if (dataList.innerHTML) {
      fieldBlock.appendChild(dataList);
    }
    mainBlock.appendChild(fieldBlock);
    i++;
  });
  return mainBlock;
};

const addReferences = (mainBlock, references) => {
  const referencesBlock = document.createElement('div');
  referencesBlock.classList.add('references-block');
  let temp;

  references.forEach(item => {
    for (let key in item) {

      if (key == 'input') {
        const elem = document.createElement(key);
        for (let value in item[key]) {
          if (value == 'checked') {
            if (item[key][value] == 'true') {
              elem.setAttribute(value, item[key][value]);
            }
          } else {
            elem.setAttribute(value, item[key][value]);
          }
        }
        referencesBlock.appendChild(elem);
      } else {
        if (key == 'text without ref') {
          const text = document.createElement('p');
          text.innerText = item[key];
          referencesBlock.appendChild(text);
        } else if (key == 'text' || key == 'ref') {
          const link = document.createElement('a');
          if (key == 'text') {
            link.innerText = item[key];
            temp = link;
          } else {
            temp.setAttribute('href', item[key]);
          }
          referencesBlock.appendChild(temp);
        }
      }
    }
  });

  if (referencesBlock.querySelectorAll('a').length > 1) {
    referencesBlock.querySelectorAll('a')[0].style.marginBottom = '0.5rem';
    referencesBlock.style.flexDirection = 'column';
  }
  mainBlock.appendChild(referencesBlock);

  return mainBlock;
};

const addButtons = (mainBlock, buttons) => {
  const buttonsBlock = document.createElement('div');
  buttonsBlock.classList.add('buttons-block');

  buttons.forEach(item => {
    for (let key in item) {
      const button = document.createElement('button');
      button.innerText = item[key];
      if (item[key].toLowerCase() == 'cancel') {
        button.style.border = '1px solid #e10101'
        button.setAttribute('type', 'reset');
      }
      buttonsBlock.appendChild(button);
    }
  });

  mainBlock.appendChild(buttonsBlock);

  return mainBlock;
};

const createForm = (json) => {
  let mainBlock = document.createElement('form');

  mainBlock.classList.add('form-block');
  mainBlock.setAttribute('action', '#');
  //title
  const titleElem = document.createElement('h2');
  titleElem.classList.add('form-block-title');
  titleElem.textContent = setTitle(json.name);
  mainBlock.appendChild(titleElem);
  //content
  mainBlock = fillByContent(mainBlock, json.fields);
  //references
  if (json.references) {
    mainBlock = addReferences(mainBlock, json.references);
  }
  //buttons
  if (json.buttons) {
    mainBlock = addButtons(mainBlock, json.buttons);
  }

  showResultBlock.appendChild(mainBlock);
}

const fileToJson = (file) => {
  const reader = new FileReader();
  reader.onload = (function (file) {
    return (e) => {
      json = JSON.parse(e.target.result);
      showFileWindow.style.display = 'none';
      fileBlockText.style.display = 'none';
      clearBtn.style.display = 'block';
      removeEventListeners();
      createForm(json);
    }
  })(file);
  reader.readAsText(file);
};

fileInput.addEventListener('change', e => {
  const target = e.target;
  const file = target.files[0];
  fileToJson(file);
});




const preventDefaults = (e) => {
  e.preventDefault();
  e.stopPropagation();
};
const wrapperAddStyle = (e) => {
  if (e.type == 'dragenter') {
    enterTarget = e.target;
  }
  wrapper.classList.add('active')
};
const wrapperRemoveStyle = (e) => {
  if (enterTarget == e.target) {
    wrapper.classList.remove('active');
  }
};
const handleDrop = (e) => {
  fileToJson(e.dataTransfer.files[0]);
}



['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  body.addEventListener(eventName, preventDefaults, false);
});

const addEventListeners = () => {
  ['dragenter', 'dragover'].forEach(eventName => {
    body.addEventListener(eventName, wrapperAddStyle, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    body.addEventListener(eventName, wrapperRemoveStyle, false);
  });

  body.addEventListener('drop', handleDrop, false);
};

addEventListeners();

const removeEventListeners = () => {
  ['dragenter', 'dragover'].forEach(eventName => {
    body.removeEventListener(eventName, wrapperAddStyle, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    body.removeEventListener(eventName, wrapperRemoveStyle, false);
  });

  body.removeEventListener('drop', handleDrop, false);
}




clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showResultBlock.innerHTML = '';
  showFileWindow.style.display = 'block';
  fileBlockText.style.display = 'block';
  clearBtn.style.display = 'none';
  addEventListeners();
})
