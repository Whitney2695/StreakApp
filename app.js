var habits = [];
var habitId = 1;
var addHabitButton = document.getElementById('add-habit-button');
var formContainer = document.getElementById('form-container');
var closeModal = document.getElementById('close-modal');
var habitForm = document.getElementById('habit-form');
addHabitButton.addEventListener('click', function () {
    formContainer.classList.remove('hidden');
});
closeModal.addEventListener('click', function () {
    formContainer.classList.add('hidden');
});
habitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var habitNameInput = document.getElementById('habit-name');
    var habitImageInput = document.getElementById('habit-image');
    var habitStartDateInput = document.getElementById('habit-start-date');
    var habitName = habitNameInput.value;
    var habitImageFile = habitImageInput.files[0];
    var habitStartDate = habitStartDateInput.value;
    var reader = new FileReader();
    reader.onloadend = function () {
        var habitImage = reader.result;
        var newHabit = {
            id: habitId++,
            name: habitName,
            image: habitImage,
            startDate: habitStartDate
        };
        addHabit(newHabit);
    };
    reader.readAsDataURL(habitImageFile);
});
function addHabit(habit) {
    fetch('http://localhost:3000/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        habits.push(data);
        displayHabits();
        formContainer.classList.add('hidden');
        resetForm();
    })
        .catch(function (error) { return console.error('Error:', error); });
}
function fetchHabits() {
    fetch('http://localhost:3000/habits')
        .then(function (response) { return response.json(); })
        .then(function (data) {
        habits = data;
        displayHabits();
    })
        .catch(function (error) { return console.error('Error:', error); });
}
function displayHabits() {
    var habitsContainer = document.getElementById('habits-container');
    habitsContainer.innerHTML = '';
    habits.forEach(function (habit) {
        var habitCard = document.createElement('div');
        habitCard.className = 'habit-card';
        var habitImage = document.createElement('img');
        habitImage.src = habit.image;
        habitImage.alt = habit.name;
        habitCard.appendChild(habitImage);
        var habitName = document.createElement('p');
        habitName.textContent = habit.name;
        habitCard.appendChild(habitName);
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent triggering the habit click event
            deleteHabit(habit.id);
        });
        habitCard.appendChild(deleteButton);
        habitCard.addEventListener('click', function () {
            var daysSinceStart = calculateDays(habit.startDate);
            var daysElement = document.createElement('p');
            daysElement.textContent = "".concat(habit.name, " started ").concat(daysSinceStart, " days ago.");
            daysElement.className = 'days';
            if (habitCard.querySelector('p.days')) {
                habitCard.querySelector('p.days').textContent = daysElement.textContent;
            }
            else {
                habitCard.appendChild(daysElement);
            }
        });
        habitsContainer.appendChild(habitCard);
    });
}
function deleteHabit(id) {
    console.log("Attempting to delete habit with ID: ".concat(id)); // Debugging statement
    fetch("http://localhost:3000/habits/".concat(id), {
        method: 'DELETE',
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Failed to delete habit');
        }
        console.log("Successfully deleted habit with ID: ".concat(id)); // Debugging statement
        habits = habits.filter(function (habit) { return habit.id !== id; });
        displayHabits();
    })
        .catch(function (error) { return console.error('Error:', error); });
}
function calculateDays(startDate) {
    var start = new Date(startDate);
    var now = new Date();
    var diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
function resetForm() {
    var habitNameInput = document.getElementById('habit-name');
    var habitImageInput = document.getElementById('habit-image');
    var habitStartDateInput = document.getElementById('habit-start-date');
    habitNameInput.value = '';
    habitImageInput.value = '';
    habitStartDateInput.value = '';
}
// Fetch and display habits initially
fetchHabits();
