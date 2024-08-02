document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const themeSelector = document.getElementById('theme-selector');
    const goalForm = document.getElementById('goal-form');
    const goalsContainer = document.getElementById('goals-container');
    const deleteModal = document.getElementById('delete-confirmation');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const addGoalButton = document.getElementById('add-goal');
    const goalTitleInput = document.getElementById('goal-title');
    const goalDescriptionInput = document.getElementById('goal-description');
    const goalYearSpanInput = document.getElementById('goal-year-span');
    const mainProgressBarFill = document.getElementById('main-progress-bar-fill');
    const quoteText = document.getElementById('quote-text');
  
    // Quotes array
    const quotes = [
      "The best way to predict the future is to create it.",
      "Believe you can and you're halfway there.",
      "Success is not the key to happiness. Happiness is the key to success.",
      "You are never too old to set another goal or to dream a new dream.",
      "It does not matter how slowly you go as long as you do not stop.",
      "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "Dream it. Wish it. Do it.",
      "Success doesn’t just find you. You have to go out and get it."
    ];
  
    let currentQuoteIndex = 0;
  
    // Show next quote every 5 seconds
    function showNextQuote() {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      quoteText.textContent = quotes[currentQuoteIndex];
    }
  
    setInterval(showNextQuote, 5000);
  
    // Initialize goals and goal to delete
    let goals = JSON.parse(localStorage.getItem('goals')) || {};
    let goalToDelete = null;
  
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      themeSelector.value = savedTheme;
      applyTheme(savedTheme);
    }
  
    // Theme switching
    themeSelector.addEventListener('change', function() {
      const selectedTheme = themeSelector.value;
      applyTheme(selectedTheme);
      localStorage.setItem('theme', selectedTheme);
    
    });
    // Initialize SortableJS
    new Sortable(goalsContainer, {
        animation: 150,
        scroll: true,
        scrollSensitivity: 30, // How close the mouse pointer must be to the edge to start scrolling
        scrollSpeed: 10, // Speed of scrolling
        onEnd: function(evt) {
            updateGoalPriorities();
        }
    });
    // Initialize goals
    // Add goal
    addGoalButton.addEventListener('click', function() {
        const title = goalTitleInput.value;
        const description = goalDescriptionInput.value;
        const yearSpan = goalYearSpanInput.value;
        if (title && description && yearSpan) {
            const goalId = `goal-${Date.now()}`;
            const goal = {
                id: goalId,
                title: title,
                description: description,
                yearSpan: yearSpan,
                subGoals: [],
                completedSubGoals: 0,
                priority: 'medium' // Default priority
            };
            goals[goalId] = goal;
            saveGoals();
            renderGoals();
            goalTitleInput.value = '';
            goalDescriptionInput.value = '';
            goalYearSpanInput.value = '';
        } else {
            alert('Please fill out all fields.');
        }
    });

    // Update goal priorities
    function updateGoalPriorities() {
        const goalElements = document.querySelectorAll('.goal-item');
        goalElements.forEach((goalElement, index) => {
            const goalId = goalElement.id;
            if (index === 0) {
                setGoalPriority(goalId, 'high');
            } else if (index === goalElements.length - 1) {
                setGoalPriority(goalId, 'low');
            } else {
                setGoalPriority(goalId, 'medium');
            }
        });
    }
    
    // Apply theme
    function applyTheme(theme) {
      const themeStylesheet = document.getElementById('theme-stylesheet');
      themeStylesheet.href = `5yearGoal.css`; // Update the href to point to the themes folder
      document.body.className = theme;
    }
  
    // Save goals
    function saveGoals() {
      localStorage.setItem('goals', JSON.stringify(goals));
      updateMainProgress();
    }
  
    // Update main progress
    function updateMainProgress() {
      const totalGoals = Object.keys(goals).length;
      if (totalGoals === 0) {
        mainProgressBarFill.style.width = '0%';
        mainProgressBarFill.textContent = '0%';
        return;
      }
      const totalSubGoals = Object.values(goals).reduce((sum, goal) => sum + goal.subGoals.length, 0);
      const totalCompletedSubGoals = Object.values(goals).reduce((sum, goal) => sum + goal.completedSubGoals, 0);
      const overallProgress = totalSubGoals === 0 ? 0 : (totalCompletedSubGoals / totalSubGoals) * 100;
      mainProgressBarFill.style.width = `${overallProgress}%`;
      mainProgressBarFill.textContent = `${Math.round(overallProgress)}%`;
    }
  
    // Render goals
    function renderGoals() {
      goalsContainer.innerHTML = '';
      const sortedGoals = Object.values(goals).sort((a, b) => {
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      sortedGoals.forEach(goal => {
        const goalElement = createGoalElement(goal);
        goalsContainer.appendChild(goalElement);
      });
      updateMainProgress();
    }
  
    // Create goal element
    function createGoalElement(goal) {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.id = goal.id;
        goalElement.draggable = true; // Make the goal item draggable

        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '⇅'; // Draggable indicator
        goalElement.appendChild(dragHandle);

  
      const goalHeader = document.createElement('div');
      goalHeader.className = 'goal-header';
  
      const title = document.createElement('h3');
      title.textContent = goal.title;
      goalHeader.appendChild(title);
  
      const yearSpan = document.createElement('span');
      yearSpan.textContent = ` (${goal.yearSpan})`;
      goalHeader.appendChild(yearSpan);
  
      const progressBarContainer = document.createElement('div');
      progressBarContainer.className = 'progress-bar';
      goalHeader.appendChild(progressBarContainer);
  
      const progressBarFill = document.createElement('div');
      progressBarFill.className = 'progress-bar-fill';
      progressBarContainer.appendChild(progressBarFill);
  
      const editButton = document.createElement('button');
        editButton.className = 'edit-btn'; // Add a class to the edit button
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
        if (editButton.textContent === 'Edit') {
            title.contentEditable = 'true';
            description.contentEditable = 'true';
            yearSpan.contentEditable = 'true';
            editButton.textContent = 'Done';
        } else {
            title.contentEditable = 'false';
            description.contentEditable = 'false';
            yearSpan.contentEditable = 'false';
            goal.title = title.textContent;
            goal.description = description.textContent;
            goal.yearSpan = yearSpan.textContent;
            editButton.textContent = 'Edit';
            saveGoals();
        }
        });
        goalHeader.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn'; // Add a class to the delete button
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
        goalToDelete = goal.id;
        deleteModal.style.display = 'block';
        });
      goalHeader.appendChild(deleteButton);
  
      const priorityLabel = document.createElement('span');
      priorityLabel.textContent = 'Priority: ';
      goalHeader.appendChild(priorityLabel);
  
      const highPriorityButton = createPriorityButton(goal, 'high', '!!!');
      const mediumPriorityButton = createPriorityButton(goal, 'medium', '!!');
      const lowPriorityButton = createPriorityButton(goal, 'low', '!');
  
      goalHeader.appendChild(highPriorityButton);
      goalHeader.appendChild(mediumPriorityButton);
      goalHeader.appendChild(lowPriorityButton);
  
      updatePriorityButtonState(goal.priority, highPriorityButton, mediumPriorityButton, lowPriorityButton);
  
      goalElement.appendChild(goalHeader);
  
      const description = document.createElement('p');
      description.textContent = goal.description;
      goalElement.appendChild(description);
  
      const subGoalsContainer = document.createElement('div');
      subGoalsContainer.className = 'sub-goals-container';
  
      const addSubGoalInput = document.createElement('input');
      addSubGoalInput.type = 'text';
      addSubGoalInput.placeholder = 'Add a sub-goal';
      addSubGoalInput.id = 'add-sub-goal-input';
      addSubGoalInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission on Enter key
          addSubGoalButton.click();
        }
      });
      subGoalsContainer.appendChild(addSubGoalInput);
  
      const addSubGoalButton = document.createElement('button');
      addSubGoalButton.textContent = 'Add Sub-Goal';
      addSubGoalButton.id = 'add-sub-goal-button';
      addSubGoalButton.addEventListener('click', function() {
        const subGoalText = addSubGoalInput.value;
        if (subGoalText) {
          const subGoalId = `sub-goal-${Date.now()}`;
          goal.subGoals.push({
            id: subGoalId,
            text: subGoalText,
            completed: false
          });
          saveGoals();
          renderGoals();
        }
      });
      subGoalsContainer.appendChild(addSubGoalButton);
  
      const hideSubGoalsButton = document.createElement('button');
        hideSubGoalsButton.className = 'hide-subgoals-btn'; // Add a class to the button
        hideSubGoalsButton.textContent = 'Hide Sub-Goals';
        hideSubGoalsButton.addEventListener('click', function() {
        const isHidden = subGoalsContainer.style.display === 'none';
        subGoalsContainer.style.display = isHidden ? 'block' : 'none';
        hideSubGoalsButton.textContent = isHidden ? 'Hide Sub-Goals' : 'Show Sub-Goals';
        });
      goalHeader.appendChild(hideSubGoalsButton);
  
      goal.subGoals.forEach(subGoal => {
        const subGoalElement = document.createElement('div');
        subGoalElement.className = 'sub-goal-item';
  
        const subGoalCheckbox = document.createElement('input');
        subGoalCheckbox.type = 'checkbox';
        subGoalCheckbox.checked = subGoal.completed;
        subGoalCheckbox.addEventListener('change', function() {
          subGoal.completed = subGoalCheckbox.checked;
          goal.completedSubGoals = goal.subGoals.filter(sg => sg.completed).length;
          saveGoals();
          updateGoalProgress(goalElement, goal);
        });
        subGoalElement.appendChild(subGoalCheckbox);
  
        const subGoalText = document.createElement('span');
        subGoalText.textContent = subGoal.text;
        subGoalText.contentEditable = 'true';
        subGoalElement.appendChild(subGoalText);
  
        const deleteSubGoalButton = document.createElement('button');
        deleteSubGoalButton.className = 'delete-button';
        deleteSubGoalButton.addEventListener('click', function() {
          goal.subGoals = goal.subGoals.filter(sg => sg.id !== subGoal.id);
          goal.completedSubGoals = goal.subGoals.filter(sg => sg.completed).length;
          saveGoals();
          renderGoals();
        });
        subGoalElement.appendChild(deleteSubGoalButton);
  
        subGoalsContainer.appendChild(subGoalElement);
      });
      goalElement.appendChild(subGoalsContainer);
  
      updateGoalProgress(goalElement, goal);
  
      return goalElement;
    }
  
    // Create priority button
    function createPriorityButton(goal, priority, marks) {
      const button = document.createElement('button');
      button.className = 'priority-button';
      button.textContent = marks;
      button.dataset.priority = priority;
      button.addEventListener('click', function() {
        setGoalPriority(goal.id, priority);
      });
      return button;
    }
  
    // Set goal priority
    function setGoalPriority(goalId, priority) {
      const goal = goals[goalId];
      goal.priority = priority;
      saveGoals();
      renderGoals();
    }
  
    // Update priority button state
    function updatePriorityButtonState(priority, highButton, mediumButton, lowButton) {
      highButton.style.backgroundColor = priority === 'high' ? 'red' : 'gray';
      mediumButton.style.backgroundColor = priority === 'medium' ? 'yellow' : 'gray';
      lowButton.style.backgroundColor = priority === 'low' ? 'green' : 'gray';
    }
  
    // Update goal progress
    function updateGoalProgress(goalElement, goal) {
      const totalSubGoals = goal.subGoals.length;
      const completedSubGoals = goal.subGoals.filter(sg => sg.completed).length;
      const progress = totalSubGoals === 0 ? 0 : (completedSubGoals / totalSubGoals) * 100;
      const progressBarFill = goalElement.querySelector('.progress-bar-fill');
      progressBarFill.style.width = `${progress}%`;
      progressBarFill.textContent = `${Math.round(progress)}%`;
      updateMainProgress();
    }
  
    // Confirm delete button
    confirmDeleteButton.addEventListener('click', function() {
      if (goalToDelete) {
        delete goals[goalToDelete];
        saveGoals();
        renderGoals();
        goalToDelete = null;
        deleteModal.style.display = 'none';
      }
    });
  
    // Cancel delete button
    cancelDeleteButton.addEventListener('click', function() {
      goalToDelete = null;
      deleteModal.style.display = 'none';
    });
  
    // Render goals
    renderGoals();
  });
