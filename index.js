// TASK: import helper functions from utils
import{
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask
}from './utils/taskFunctions.js';

import{initialData} from './initialData.js';
// TASK: import initialData


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
      // Navigation Sidebar 

      sideBarDiv: document.getElementById("side-bar-div"),
      logo: document.getElementById("side-logo-div"),
      boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
      toggleSwitch: document.getElementById("switch"),
      hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
      showSideBarBtn: document.getElementById("show-side-bar-btn"),

      // Main elements
      headerBoardName: document.getElementById("header-board-name"),
      // addNewTaskButton: document.getElementById("add-new-task-btn"),
      editBoardButton: document.getElementById("edit-board-btn"),
      editBoardDiv: document.getElementById("editBoardDiv"),
      themeSwitch: document.getElementById("switch"),
      createNewTaskBtn: document.getElementById("add-new-task-btn"),

      // New task modal elements
      newTaskModalWindow:document.getElementById("new-task-modal-window"),
      titleInput: document.getElementById("title-input"),
      descInput: document.getElementById("desc-input"),
      selectStatus: document.getElementById("select-status"),


      // Edit task for modal elements 
      modalWindow: document.querySelector(".edit-task-modal-window"),
      editTaskTitleInput: document.getElementById("edit-task-title-input"),
      editTaskDescInput: document.getElementById("edit-task-desc-input"),
      editSelectStatus: document.getElementById("edit-select-status"),

      columnDivs: document.querySelectorAll('.column-div'),

      // Filter elements 
      filterDiv: document.getElementById("filterDiv"),
};

// console.log(elements); 

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");


    boardElement.addEventListener('click', function()  { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.onclick = () => { 
        openEditTaskModal(task);
      };

      tasksContainer.appendChild(taskElement);
    });
  });
}



function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {
      btn.classList.remove('active');
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event)
    toggleModal(false, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'none';
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  const title = document.getElementById("title-input").value;
  const description = document.getElementById("desc-input").value; 
  const status = document.getElementById("select-status").value;

  //Assign user input to the task object
    const task = {
      title: title,
      description:description,
      status: status,
      board: activeBoard
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  if (show){
    elements.sideBarDiv.style.display = 'block'
    elements.showSideBarBtn.style.display = 'none'
  } else {
    elements.sideBarDiv.style.display = 'none'
    elements.showSideBarBtn.style.display = 'block'
  }
 
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme');
  elements.themeSwitch.checked = isLightTheme;
  localStorage.getItem('light-theme', isLightTheme)
 const logo = document.getElementById("logo");
 logo.src = logo.src.replace(isLightTheme ? "logo-dark.svg" : "logo-light.svg", isLightTheme ? "logo-light.svg" : "logo-dark.svg");
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  // Call saveTaskChanges upon click of Save Changes button
 saveChangesBtn.addEventListener('click', function(){
  saveTaskChanges(task.id);
 });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', function(){
  deleteTask(task.id);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
 });

 // Close the task modal upon click of Cancel button
 cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = elements.editTaskTitleInput.value;
  const updatedDescription = elements.editTaskDescInput.value;
  const updatedStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    description: updatedDescription,
    status: updatedStatus,
    board: activeBoard
  };

  // Update task using a hlper functoin
  putTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  toggleTheme(isLightTheme)
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}