// ============================================================
//  COREMATRIX — services.js
//  Phase 2: Custom DataService factory (Dependency Injection)
//  Phase 3: $http calls to Node.js backend API
// ============================================================

app.factory('DataService', function($http, $q, $window) {

  var API = (function() {
    if ($window.location.protocol === 'file:') {
      return 'http://localhost:3000/api';
    }

    if ($window.location.hostname === 'localhost' && String($window.location.port || '') === '3000') {
      return $window.location.origin + '/api';
    }

    return 'http://localhost:3000/api';
  })();
  var STORAGE_USER_KEY = 'corematrix.currentUser';

  var _workouts = [
    { id: 1, name: 'Bench Press',      category: 'Chest',     sets: 4, reps: 10, weight: 80,  intensity: 'high',   date: '2025-06-01' },
    { id: 2, name: 'Deadlift',         category: 'Back',      sets: 3, reps: 5,  weight: 120, intensity: 'high',   date: '2025-06-02' },
    { id: 3, name: 'Squat',            category: 'Legs',      sets: 4, reps: 8,  weight: 100, intensity: 'high',   date: '2025-06-03' },
    { id: 4, name: 'Overhead Press',   category: 'Shoulders', sets: 3, reps: 10, weight: 60,  intensity: 'medium', date: '2025-06-04' },
    { id: 5, name: 'Pull Ups',         category: 'Back',      sets: 4, reps: 12, weight: 0,   intensity: 'medium', date: '2025-06-05' },
    { id: 6, name: 'Bicep Curls',      category: 'Arms',      sets: 3, reps: 15, weight: 20,  intensity: 'low',    date: '2025-06-06' },
  ];

  var _meals = [
    { id: 1, name: 'Oats + Whey Protein',  type: 'Breakfast', calories: 420, protein: 40, carbs: 55, fat: 8,  date: '2025-06-01' },
    { id: 2, name: 'Grilled Chicken Bowl', type: 'Lunch',     calories: 580, protein: 52, carbs: 45, fat: 14, date: '2025-06-01' },
    { id: 3, name: 'Banana + Peanut Butter', type: 'Snack',   calories: 280, protein: 8,  carbs: 36, fat: 12, date: '2025-06-01' },
    { id: 4, name: 'Salmon + Brown Rice',   type: 'Dinner',    calories: 620, protein: 48, carbs: 60, fat: 18, date: '2025-06-01' },
  ];

  var _nextWorkoutId = 7;
  var _nextMealId = 5;
  var _currentUser = loadStoredUser();

  function loadStoredUser() {
    try {
      return JSON.parse($window.localStorage.getItem(STORAGE_USER_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function persistUser(user) {
    if (user) {
      $window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      $window.localStorage.removeItem(STORAGE_USER_KEY);
    }
  }

  function getCurrentUserId() {
    return _currentUser && _currentUser.userId ? _currentUser.userId : 1;
  }

  function withUserId(path) {
    var joiner = path.indexOf('?') === -1 ? '?' : '&';
    return path + joiner + 'userId=' + encodeURIComponent(getCurrentUserId());
  }

  function apiGet(path, fallback) {
    var deferred = $q.defer();
    $http.get(API + path)
      .then(function(res) { deferred.resolve(res.data); })
      .catch(function()   { deferred.resolve(fallback); });
    return deferred.promise;
  }

  function apiPost(path, payload, localAction) {
    var deferred = $q.defer();
    $http.post(API + path, payload)
      .then(function(res) { deferred.resolve(res.data); })
      .catch(function()   { localAction(); deferred.resolve(payload); });
    return deferred.promise;
  }

  function apiPut(path, payload, localAction) {
    var deferred = $q.defer();
    $http.put(API + path, payload)
      .then(function(res) { deferred.resolve(res.data); })
      .catch(function()   { localAction(); deferred.resolve(payload); });
    return deferred.promise;
  }

  function apiDelete(path, localAction) {
    var deferred = $q.defer();
    $http.delete(API + path)
      .then(function(res) { deferred.resolve(res.data); })
      .catch(function()   { localAction(); deferred.resolve({ success: true }); });
    return deferred.promise;
  }

  function sortWorkouts(list) {
    return list.slice().sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  function sortMeals(list) {
    return list.slice().sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  function ensureNextIds() {
    _nextWorkoutId = Math.max.apply(null, _workouts.map(function(item) { return item.id; }).concat([0])) + 1;
    _nextMealId = Math.max.apply(null, _meals.map(function(item) { return item.id; }).concat([0])) + 1;
  }

  function loadCurrentUserData() {
    if (!_currentUser || !_currentUser.userId) {
      return $q.resolve({ workouts: _workouts, meals: _meals });
    }

    return $q.all([
      apiGet('/workouts?userId=' + encodeURIComponent(_currentUser.userId), _workouts),
      apiGet('/meals?userId=' + encodeURIComponent(_currentUser.userId), _meals)
    ]).then(function(results) {
      _workouts = sortWorkouts(results[0] || []);
      _meals = sortMeals(results[1] || []);
      ensureNextIds();
      return { workouts: _workouts, meals: _meals };
    });
  }

  return {
    setCurrentUser: function(user) {
      _currentUser = user || null;
      persistUser(_currentUser);
      return _currentUser;
    },

    getCurrentUser: function() {
      return _currentUser;
    },

    clearCurrentUser: function() {
      _currentUser = null;
      persistUser(null);
      _workouts = [];
      _meals = [];
    },

    loadCurrentUserData: loadCurrentUserData,

    register: function(payload) {
      return $http.post(API + '/auth/register', payload).then(function(res) {
        return res.data;
      });
    },

    login: function(payload) {
      return $http.post(API + '/auth/login', payload).then(function(res) {
        return res.data;
      });
    },

    getDailyTip: function() {
      return $http.get(API + '/tip').then(function(res) {
        return res.data;
      });
    },

    addWorkout: function(workout) {
      var payload = angular.extend({}, workout, {
        userId: getCurrentUserId(),
        date: workout.date || new Date().toISOString().split('T')[0]
      });

      if (!payload.id) {
        payload.id = _nextWorkoutId++;
      }

      return apiPost('/workouts', payload, function() {
        _workouts.unshift(payload);
      }).then(function(created) {
        if (created && created.id) {
          _workouts = sortWorkouts(_workouts.concat([created]));
          ensureNextIds();
        }
        return created;
      });
    },

    getWorkouts: function() {
      return apiGet(withUserId('/workouts'), sortWorkouts(_workouts));
    },

    updateWorkout: function(updated) {
      var payload = angular.extend({}, updated, {
        userId: getCurrentUserId()
      });

      return apiPut('/workouts/' + updated.id, payload, function() {
        var idx = _workouts.findIndex(function(workout) { return workout.id === updated.id; });
        if (idx > -1) {
          _workouts[idx] = payload;
        }
      }).then(function() {
        var index = _workouts.findIndex(function(workout) { return workout.id === updated.id; });
        if (index > -1) {
          _workouts[index] = payload;
          _workouts = sortWorkouts(_workouts);
        }
        return payload;
      });
    },

    deleteWorkout: function(id) {
      return apiDelete('/workouts/' + id + '?userId=' + encodeURIComponent(getCurrentUserId()), function() {
        _workouts = _workouts.filter(function(workout) { return workout.id !== id; });
      }).then(function(response) {
        _workouts = _workouts.filter(function(workout) { return workout.id !== id; });
        return response;
      });
    },

    getWorkoutsLocal: function() {
      return sortWorkouts(_workouts);
    },

    addMeal: function(meal) {
      var payload = angular.extend({}, meal, {
        userId: getCurrentUserId(),
        date: meal.date || new Date().toISOString().split('T')[0]
      });

      if (!payload.id) {
        payload.id = _nextMealId++;
      }

      return apiPost('/meals', payload, function() {
        _meals.unshift(payload);
      }).then(function(created) {
        if (created && created.id) {
          _meals = sortMeals(_meals.concat([created]));
          ensureNextIds();
        }
        return created;
      });
    },

    updateMeal: function(updated) {
      var payload = angular.extend({}, updated, {
        userId: getCurrentUserId()
      });

      return apiPut('/meals/' + updated.id, payload, function() {
        var idx = _meals.findIndex(function(meal) { return meal.id === updated.id; });
        if (idx > -1) {
          _meals[idx] = payload;
        }
      }).then(function() {
        var index = _meals.findIndex(function(meal) { return meal.id === updated.id; });
        if (index > -1) {
          _meals[index] = payload;
          _meals = sortMeals(_meals);
        }
        return payload;
      });
    },

    getMeals: function() {
      return apiGet(withUserId('/meals'), sortMeals(_meals));
    },

    deleteMeal: function(id) {
      return apiDelete('/meals/' + id + '?userId=' + encodeURIComponent(getCurrentUserId()), function() {
        _meals = _meals.filter(function(meal) { return meal.id !== id; });
      }).then(function(response) {
        _meals = _meals.filter(function(meal) { return meal.id !== id; });
        return response;
      });
    },

    getMealsLocal: function() { return sortMeals(_meals); },

    getTodayStats: function() {
      var today = new Date().toISOString().split('T')[0];
      var todayMeals    = _meals.filter(function(m){ return m.date === today; });
      var todayWorkouts = _workouts.filter(function(w){ return w.date === today; });
      return {
        calories: todayMeals.reduce(function(s,m){ return s + m.calories; }, 0),
        protein:  todayMeals.reduce(function(s,m){ return s + m.protein;  }, 0),
        workouts: todayWorkouts.length,
        totalSets: todayWorkouts.reduce(function(s,w){ return s + w.sets; }, 0),
      };
    },

    getWeeklyPlan: function() {
      return [
        { day: 'Monday',    group: 'PUSH',  exercises: [
            { name: 'Bench Press',     detail: '4×10 @ 80kg', intensity: 'high' },
            { name: 'Incline DB Press', detail: '3×12 @ 30kg', intensity: 'medium' },
            { name: 'Tricep Dips',      detail: '3×15 BW',    intensity: 'low' },
        ]},
        { day: 'Tuesday',   group: 'PULL',  exercises: [
            { name: 'Deadlift',        detail: '3×5 @ 120kg', intensity: 'high' },
            { name: 'Pull Ups',        detail: '4×12 BW',     intensity: 'medium' },
            { name: 'Bicep Curls',     detail: '3×15 @ 20kg', intensity: 'low' },
        ]},
        { day: 'Wednesday', group: 'REST',  exercises: [] },
        { day: 'Thursday',  group: 'LEGS',  exercises: [
            { name: 'Back Squat',      detail: '4×8 @ 100kg', intensity: 'high' },
            { name: 'Romanian DL',     detail: '3×10 @ 80kg', intensity: 'medium' },
            { name: 'Calf Raises',     detail: '4×20 @ 40kg', intensity: 'low' },
        ]},
        { day: 'Friday',    group: 'PUSH',  exercises: [
            { name: 'OHP',             detail: '3×10 @ 60kg', intensity: 'high' },
            { name: 'Lateral Raises',  detail: '4×15 @ 10kg', intensity: 'low' },
            { name: 'Skull Crushers',  detail: '3×12 @ 25kg', intensity: 'medium' },
        ]},
        { day: 'Saturday',  group: 'PULL',  exercises: [
            { name: 'Barbell Row',     detail: '4×8 @ 80kg',  intensity: 'high' },
            { name: 'Face Pulls',      detail: '4×15 @ 20kg', intensity: 'low' },
            { name: 'Hammer Curls',    detail: '3×12 @ 18kg', intensity: 'medium' },
        ]},
        { day: 'Sunday',    group: 'REST',  exercises: [] },
      ];
    }
  };
});
