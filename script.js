const addBtns = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemBtns = document.querySelectorAll(".solid");
const addItemContainers = document.querySelectorAll(".add-container");
const addItems = document.querySelectorAll(".add-item");
// Item Lists
const listColumns = document.querySelectorAll(".drag-item-list");
const backlogList = document.getElementById("backlog-list");
const progressList = document.getElementById("progress-list");
const completeList = document.getElementById("complete-list");
const onHoldList = document.getElementById("on-hold-list");

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem = false;
let currentColumn;
let isDragging; // to prevent the error that when we click in the item we are editing it so it don´t allow to drag the item.

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem("backlogItems")) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ["Release the course", "Sit back and relax"];
    progressListArray = ["Work on projects", "Listen to music"];
    completeListArray = ["Being cool", "Getting stuff done"];
    onHoldListArray = ["Being uncool"];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [
    backlogListArray,
    progressListArray,
    completeListArray,
    onHoldListArray,
  ];
  const arrayNames = ["backlog", "progress", "complete", "onHold"];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(
      `${arrayName}Items`,
      JSON.stringify(listArrays[index])
    );
  });
}
// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
  // List Item
  const listEl = document.createElement("li");
  listEl.textContent = item;
  listEl.id = index;
  listEl.classList.add("drag-item");
  listEl.draggable = true;
  listEl.setAttribute("onfocusout", `updateItem(${index},${column})`);
  listEl.setAttribute("ondragstart", "drag(event)"); // function to know what happens when start to drag
  listEl.contentEditable = true;
  // adding the text to the element
  listEl.textContent = item;
  // apend
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column
  backlogList.textContent = ""; // reset backlog Column
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogList, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  // Progress Column
  progressList.textContent = ""; // reset progress Column
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressList, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  // Complete Column
  completeList.textContent = ""; // reset complete Column
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeList, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  // On Hold Column
  onHoldList.textContent = ""; // reset onHold Column
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldList, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true;
  updateSavedColumns();
}

// update an item when user change it or deleted if necessary
function updateItem(index, column) {
  const selectedArray = listArrays[column];
  const selectedColumnEl = listColumns[column].children;
  const newTextContent = selectedColumnEl[index].textContent;

  if (!isDragging) {
    // only when we are not dragging will be able to edit items because if we dont have this we´ll have a problem
    // the problem is that the app don´t know if we are trying to edit or to drag
    if (!newTextContent) {
      delete listArrays[column][index];
    } else {
      listArrays[column][index] = newTextContent;
    }
    updateDOM();
    updateSavedColumns();
  }
}

// allows arrays to reflec drag and drop items
function rebuiltArrays() {
  // backlogListArray = []; //reset the array to not duplicate the items
  // for (let i = 0; i < backlogList.children.length; i++) {
  //   backlogListArray.push(backlogList.children[i].textContent);
  // }

  // I´ll refactor this block above (and the same block for progress, complete and onHold) the blocks were the same one right above just
  // changed the names but I deleted them because  I refactored
  backlogListArray = Array.from(backlogList.children).map(
    (item) => item.textContent
  ); // this line replace 4 lines above, backlogList is HTML collection so it needs to be an array to use .map for that use Array.from()
  progressListArray = Array.from(progressList.children).map(
    (item) => item.textContent
  );
  completeListArray = Array.from(completeList.children).map(
    (item) => item.textContent
  );
  onHoldListArray = Array.from(onHoldList.children).map(
    (item) => item.textContent
  );
  updateDOM();
}
// what happens when element start dragging
function drag(event) {
  draggedItem = event.target;
  isDragging = true; // when we are dragging this is true, and not allow to update the element
}
//Column Allows for item to drop , this function has to be in every column container
function allowDrop(event) {
  event.preventDefault();
}
// Dropping item in column  , this function has to be in every column container
function drop(event) {
  event.preventDefault();
  // remove styles when the element is over
  listColumns.forEach((column) => {
    column.classList.remove("over");
  });
  // Add item to the column
  const parent = listColumns[currentColumn];
  parent.appendChild(draggedItem);
  rebuiltArrays();
  isDragging = false; // when the drop is succesfull it means we are not dragging so in this point we can update the item, not before
}
// what happens when item enters to column area
function dragEnter(column) {
  listColumns[column].classList.add("over"); // adding styles when element enter in the column area
  currentColumn = column;
}
// add the text typed in the add div to the column and reset the text box
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = ""; // reset the input
  updateDOM();
}
// show add item input box
function showInputBox(column) {
  addBtns[column].style.visibility = "hidden";
  saveItemBtns[column].style.display = "flex";
  addItemContainers[column].style.display = "flex";
}
// hide add item input box
function hideInputBox(column) {
  addBtns[column].style.visibility = "visible";
  saveItemBtns[column].style.display = "none";
  addItemContainers[column].style.display = "none";
  addToColumn(column);
}
// filter arrays to remove empty items (1 use is to remove localStorage when delete an item)
function filterArray(array) {
  const filteredArray = array.filter((element) => element !== null);
  return filteredArray;
}
// on Load
updateDOM();
