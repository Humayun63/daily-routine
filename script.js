const routineKey = "dailyRoutine"; // Key for local storage

// Initialize the routine from local storage or use the default
const routine = JSON.parse(localStorage.getItem(routineKey)) || [
  { time: "4:15 AM - 5:40 AM", task: "Spiritual Connection", completed: false },
  { time: "5:40 AM - 6:30 AM", task: "Fajr Prayer & Quran", completed: false },
  { time: "6:30 AM - 7:00 AM", task: "Morning Exercise", completed: false },
  { time: "7:00 AM - 7:30 AM", task: "Breakfast & Freshen Up", completed: false },
  { time: "7:30 AM - 8:25 AM", task: "Work", completed: false },
  { time: "8:30 AM - 8:35 AM", task: "Daily Standup", completed: false },
  { time: "8:35 AM - 10:35 AM", task: "Work", completed: false },
  { time: "10:40 AM - 12:40 PM", task: "Work", completed: false },
  { time: "12:40 PM - 1:00 PM", task: "Qailullah (Power Nap)", completed: false },
  { time: "1:00 PM - 1:15 PM", task: "Shower", completed: false },
  { time: "1:15 PM - 1:50 PM", task: "Dhuhr Prayer", completed: false },
  { time: "1:50 PM - 2:10 PM", task: "Lunch", completed: false },
  { time: "2:10 PM - 3:50 PM", task: "Work", completed: false },
  { time: "3:50 PM - 4:15 PM", task: "Asr Prayer", completed: false },
  { time: "4:15 PM - 5:15 PM", task: "Work", completed: false },
  { time: "5:15 PM - 6:00 PM", task: "Maghrib Prayer & Quran", completed: false },
  { time: "6:00 PM - 6:30 PM", task: "Work", completed: false },
  { time: "6:30 PM - 7:00 PM", task: "Dinner", completed: false },
  { time: "7:00 PM - 7:40 PM", task: "Isha Prayer", completed: false },
  { time: "7:40 PM - 8:00 PM", task: "Book Reading", completed: false },
  { time: "8:00 PM - 10:00 PM", task: "Skill Development", completed: false },
];

const routineContainer = document.getElementById("routine-container");
const progressBar = document.getElementById("progress");

// Save routine data to localStorage
function saveRoutine() {
  localStorage.setItem(routineKey, JSON.stringify(routine));
}

// Get current time in a comparable format
function getCurrentTime() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Convert time range to a comparable format (e.g., "4:15 AM - 5:40 AM" → [255, 340])
function parseTimeRange(timeRange) {
  const [start, end] = timeRange.split(" - ").map((time) => {
    const [hour, minute, period] = time.match(/(\d+):(\d+)\s(AM|PM)/).slice(1);
    let hours = parseInt(hour, 10);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + parseInt(minute, 10);
  });
  return [start, end];
}

// Sort tasks dynamically
function sortTasks() {
  const now = getCurrentTime();
  return routine
    .map((task, index) => ({
      ...task,
      index,
      times: parseTimeRange(task.time),
    }))
    .sort((a, b) => {
      const isCurrentA = now >= a.times[0] && now < a.times[1];
      const isCurrentB = now >= b.times[0] && now < b.times[1];

      if (isCurrentA) return -1;
      if (isCurrentB) return 1;

      if (a.completed !== b.completed) return a.completed - b.completed;
      if (now > a.times[1]) return 1; // Past task
      if (now > b.times[1]) return -1; // Past task
      return a.index - b.index; // Maintain initial order for future tasks
    });
}

// Render routine tasks
function renderRoutine() {
  routineContainer.innerHTML = ""; // Clear existing items
  const sortedRoutine = sortTasks();
  let completedTasks = 0;

  sortedRoutine.forEach((item) => {
    if (item.completed) completedTasks++;

    const routineItem = document.createElement("div");
    routineItem.className = `routine-item ${item.completed ? "completed" : ""} ${
      item.times[0] <= getCurrentTime() && item.times[1] > getCurrentTime() ? "current" : ""
    }`;

    routineItem.innerHTML = `
      <div>
        <strong>${item.time}</strong><br>
        ${item.task}
      </div>
      <button onclick="toggleTask(${item.index})" ${item.completed ? "disabled" : ""}>
        ${item.completed ? "Done" : "Mark as Done"}
      </button>
    `;

    routineContainer.appendChild(routineItem);
  });

  updateProgress(completedTasks);
}

// Toggle task completion
function toggleTask(index) {
  routine[index].completed = true;
  saveRoutine(); // Save updated routine to local storage
  renderRoutine();
}

// Update progress bar
function updateProgress(completedTasks) {
  const progressPercentage = (completedTasks / routine.length) * 100;
  progressBar.value = progressPercentage;
}

// Initial render
renderRoutine();

// Re-render every minute to update the current task
setInterval(renderRoutine, 60000);
