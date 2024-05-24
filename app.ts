interface Habit {
    id: number;
    name: string;
    image: string; // Base64 encoded image
    startDate: string;
}

let habits: Habit[] = [];
let habitId = 1;

const addHabitButton = document.getElementById('add-habit-button')!;
const formContainer = document.getElementById('form-container')!;
const closeModal = document.getElementById('close-modal')!;
const habitForm = document.getElementById('habit-form')!;

addHabitButton.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    formContainer.classList.add('hidden');
});

habitForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const habitNameInput = document.getElementById('habit-name') as HTMLInputElement;
    const habitImageInput = document.getElementById('habit-image') as HTMLInputElement;
    const habitStartDateInput = document.getElementById('habit-start-date') as HTMLInputElement;

    const habitName = habitNameInput.value;
    const habitImageFile = habitImageInput.files![0];
    const habitStartDate = habitStartDateInput.value;

    const reader = new FileReader();
    reader.onloadend = () => {
        const habitImage = reader.result as string;

        const newHabit: Habit = {
            id: habitId++,
            name: habitName,
            image: habitImage,
            startDate: habitStartDate
        };

        addHabit(newHabit);
    };

    reader.readAsDataURL(habitImageFile);
});

function addHabit(habit: Habit) {
    fetch('http://localhost:3000/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
    })
    .then(response => response.json())
    .then(data => {
        habits.push(data);
        displayHabits();
        formContainer.classList.add('hidden');
        resetForm();
    })
    .catch(error => console.error('Error:', error));
}

function fetchHabits() {
    fetch('http://localhost:3000/habits')
    .then(response => response.json())
    .then(data => {
        habits = data;
        displayHabits();
    })
    .catch(error => console.error('Error:', error));
}

function displayHabits() {
    const habitsContainer = document.getElementById('habits-container')!;
    habitsContainer.innerHTML = '';

    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';

        const habitImage = document.createElement('img');
        habitImage.src = habit.image;
        habitImage.alt = habit.name;
        habitCard.appendChild(habitImage);

        const habitName = document.createElement('p');
        habitName.textContent = habit.name;
        habitCard.appendChild(habitName);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the habit click event
            deleteHabit(habit.id);
        });
        habitCard.appendChild(deleteButton);

        habitCard.addEventListener('click', () => {
            const daysSinceStart = calculateDays(habit.startDate);
            const daysElement = document.createElement('p');
            daysElement.textContent = `${habit.name} started ${daysSinceStart} days ago.`;
            daysElement.className = 'days';
            if (habitCard.querySelector('p.days')) {
                habitCard.querySelector('p.days')!.textContent = daysElement.textContent;
            } else {
                habitCard.appendChild(daysElement);
            }
        });

        habitsContainer.appendChild(habitCard);
    });
}

function deleteHabit(id: number) {
    console.log(`Attempting to delete habit with ID: ${id}`); // Debugging statement
    fetch(`http://localhost:3000/habits/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete habit');
        }
        console.log(`Successfully deleted habit with ID: ${id}`); // Debugging statement
        habits = habits.filter(habit => habit.id !== id);
        displayHabits();
    })
    .catch(error => console.error('Error:', error));
}

function calculateDays(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function resetForm() {
    const habitNameInput = document.getElementById('habit-name') as HTMLInputElement;
    const habitImageInput = document.getElementById('habit-image') as HTMLInputElement;
    const habitStartDateInput = document.getElementById('habit-start-date') as HTMLInputElement;

    habitNameInput.value = '';
    habitImageInput.value = '';
    habitStartDateInput.value = '';
}

// Fetch and display habits initially
fetchHabits();
