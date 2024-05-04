const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto');
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listUsers = [];
const listExercices = [];
const listLog = []

function generateId() {
  const bytes = crypto.randomBytes(12);
  const id = bytes.toString('hex');
  return id;
}

function convertirFormato(fechaString) {
  const fecha = new Date(fechaString);

  const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const diasSemana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const diaSemana = diasSemana[fecha.getDay()];
  const mes = meses[fecha.getMonth()];
  const dia = fecha.getDate();
  const año = fecha.getFullYear();

  // Formatear la fecha en el formato deseado
  const fechaFormateada = `${diaSemana} ${mes} ${dia.toString().padStart(2, '0')} ${año}`;

  return fechaFormateada;
}

//Users
function createUser(username) {
  const id = generateId();
  listUsers.push({ id: id, username: username });
  return id;
}

function searchUserbyUserName(username) {
  return listUsers.find(item => item.username === username)
}

// Exercises
function createExercise(description, duration, date, userId) {
  exercise = { userId: userId, description: description, duration: parseInt(duration), date: date }
  listExercices.push(exercise);
  return exercise;
}

function searchUserbyId(userId) {
  return listUsers.find(item => item.id === userId)
}

function searchExerciceByUserId(userId) {
  return listExercices.filter(item => item.userId === userId).map(({ userId, ...rest}) => rest)
}

app.post('/api/users', function(req, res) {
  const username = req.body.username;
  userExist = searchUserbyUserName(username)
  if (!userExist){
    getId = createUser(username);
  }else{
    getId = userExist.id
  }
  result = {
    username: username,
    _id: getId
  }
  
  res.json(result);
});

app.post('/api/users/:_id/exercises', function(req, res) {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;

  exercise = createExercise(description, duration, date, userId);
  user = searchUserbyId(userId)
  result = {
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date:  convertirFormato(exercise.date),
    _id: user.id,
  };
  
  res.json(result);
});

app.get('/api/users/:_id/logs', function(req, res) {
  const userId = req.params._id;
  const { from, to, limit} = req.query;

  let filteredExercises = searchExerciceByUserId(userId);


  if (from || to) {
    filteredExercises = filteredExercises.filter(item => {
      const exerciseDate = new Date(item.date);
      if (from && to) {
        return exerciseDate >= new Date(from) && exerciseDate <= new Date(to);
      } else if (from) {
        return exerciseDate >= new Date(from);
      } else if (to) {
        return exerciseDate <= new Date(to);
      }
    });
  }

  if (limit) {
    filteredExercises = filteredExercises.slice(0, Number(limit));
  }

  const user = searchUserbyId(userId);

  filteredExercises.forEach(item => { item.date = convertirFormato(item.date)})

  const result = {
    username: user.username,
    count: filteredExercises.length,
    _id: user.id,
    logs: filteredExercises
  };

  res.json(result);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
