// TASK: import helper functions from utils
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
      addNewTaskButton: document.getElementById("add-new-task-btn"),
      editBoardButton: document.getElementById("edit-board-btn"),
      editBoardDiv: document.getElementById("editBoardDiv"),

      // Task column elements
      todoColumn: document.querySelector('.column-div[data-status="todo"]'),
      doingColumn: document.querySelector('.column-div[data-status="doing"]'),
      doneColumn: document.querySelector('.column-div[data-status="done"]'),

      // New task modal elements
      newTaskModalWindow:document.getElementById("new-task-modal-window"),
      titleInput: document.getElementById("title-input"),
      descInput: document.getElementById("desc-input"),
      selectStatus: document.getElementById("select-status"),

      // Edit task for modal elements 
      editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
      editTaskTitleInput: document.getElementById("edit-task-title-input"),
      editTaskDescInput: document.getElementById("edit-task-desc-input"),
      editSelectStatus: document.getElementById("edit-select-status"),

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

  // Clear a previous task before displaying the new ones
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    const tasksContainer = column.querySelector(".tasks-container");
    tasksContainer.innerHTML = '';


    // Reset column content while preserving the column title
    const columnHeadDiv = document.createElement("div");
    columnHeadDiv.classList.add("column-head-div");  
    columnHeadDiv.innerHTML = `<span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>`;
    column.insertBefore(columnHeadDiv, tasksContainer)
    

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', function() { 
        openEditTaskModal(task);
      });

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
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
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
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  const title = event.target.querySelector("#title-input").value;
  const description = event.target.querySelector("    #desc-input").value; 
  const status = event.target.querySelector("#select-status").value;

  //Assign user input to the task object
    const task = {
      title: title,
      description:description,
      status: status,
      id: generateTaskId()
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
 
}

function toggleTheme() {
 
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
  saveTaskChanges(task);
 });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', function(){
  deleteTask(task);
  toggleModal(false, elements.editTaskModal)
 });

 // Close the task modal upon click of Cancel button
 cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
 
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  

  // Create an object with the updated task details


  // Update task using a hlper functoin
 

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}