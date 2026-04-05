// ============================================================
//  COREMATRIX — controllers.js
//  Phase 2: Hierarchical Controllers + Inbuilt 4 Services
//  Services used: $scope, $location, $timeout, $filter, $http
// ============================================================


// ============================================================
//  MAIN CONTROLLER — GlobalState parent
//  Every child controller inherits $scope.user via AngularJS scope chain
// ============================================================
app.controller('MainCtrl', function($scope, $location, $timeout, DataService) {

  var defaultProfile = {
    name: 'Guest',
    goal: 'Build Muscle',
    weight: null,
    height: null,
    age: null,
    activityLevel: 'moderate',
    targetWeight: null,
    bmi: null,
    calorieGoal: null,
    proteinGoal: null,
  };

  function applyUser(user) {
    $scope.currentUser = user || null;
    $scope.user = angular.extend({}, defaultProfile, user || {});
    $scope.serverStatus = user && user.name ? ('Connected as ' + user.name) : 'Awaiting login';
    DataService.setCurrentUser(user || null);
    if (user && user.userId) {
      DataService.loadCurrentUserData();
    }
  }

  $scope.applyUser = applyUser;
  applyUser(DataService.getCurrentUser());

  $scope.profileMenuOpen = false;
  $scope.mobileNavOpen = false;

  $scope.toggleMobileNav = function(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    $scope.mobileNavOpen = !$scope.mobileNavOpen;
  };

  $scope.closeMobileNav = function() {
    $scope.mobileNavOpen = false;
  };

  $scope.toggleProfileMenu = function() {
    if (!$scope.currentUser) return;
    $scope.profileMenuOpen = !$scope.profileMenuOpen;
  };

  $scope.closeProfileMenu = function() {
    $scope.profileMenuOpen = false;
  };

  $scope.toast = { visible: false, message: '', icon: '' };

  $scope.logout = function() {
    DataService.clearCurrentUser();
    applyUser(null);
    $scope.profileMenuOpen = false;
    $scope.mobileNavOpen = false;
    $location.path('/auth');
  };

  // Which nav link is active — reads current URL path
  $scope.$on('$routeChangeStart', function(event, next) {
    var nextPath = next && (next.originalPath || (next.$$route && next.$$route.originalPath));

    if (!DataService.getCurrentUser() && nextPath !== '/auth') {
      event.preventDefault();
      $location.path('/auth');
      return;
    }

    if (DataService.getCurrentUser() && nextPath === '/auth') {
      event.preventDefault();
      $location.path('/');
      return;
    }
  });

  $scope.$on('$routeChangeSuccess', function() {
    $scope.mobileNavOpen = false;
    var path = $location.path();
    if (path === '/')         $scope.currentPage = 'home';
    else if (path === '/forge')    $scope.currentPage = 'forge';
    else if (path === '/fuel')     $scope.currentPage = 'fuel';
    else if (path === '/progress') $scope.currentPage = 'progress';
    else if (path === '/logs')     $scope.currentPage = 'logs';
  });

  // Global toast helper — used by all child controllers via $scope.$parent
  $scope.showToast = function(msg, icon) {
    $scope.toast = { visible: true, message: msg, icon: icon || '✅' };
    // $timeout (inbuilt service #2) — auto-hide toast after 3 seconds
    $timeout(function() {
      $scope.toast.visible = false;
    }, 3000);
  };

  // Hide loader after page fully loads ($timeout inbuilt service)
  $timeout(function() {
    var loader = document.getElementById('loaderScreen');
    if (loader) loader.classList.add('hidden');
  }, 2000);
});


// ============================================================
//  AUTH CONTROLLER — login / register
// ============================================================
app.controller('AuthCtrl', function($scope, $location, DataService) {
  if (DataService.getCurrentUser()) {
    $location.path('/');
    return;
  }

  $scope.mode = 'login';
  $scope.isBusy = false;
  $scope.authError = '';

  $scope.loginForm = {
    email: '',
    password: ''
  };

  $scope.registerForm = {
    name: '',
    email: '',
    password: '',
    goal: 'Build Muscle',
    weightKg: '',
    heightCm: '',
    ageYears: '',
    activityLevel: 'moderate'
  };

  $scope.emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $scope.passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  $scope.setMode = function(mode) {
    $scope.mode = mode;
    $scope.authError = '';
  };

  function establishSession(user) {
    DataService.setCurrentUser(user);
    if ($scope.$parent && $scope.$parent.applyUser) {
      $scope.$parent.applyUser(user);
    }
    DataService.loadCurrentUserData();
    $location.path('/');
  }

  $scope.login = function() {
    if (!$scope.loginForm.email || !$scope.loginForm.password) {
      $scope.authError = 'Email and password are required.';
      return;
    }

    if (!$scope.emailPattern.test($scope.loginForm.email)) {
      $scope.authError = 'Enter a valid email address.';
      return;
    }

    $scope.isBusy = true;
    $scope.authError = '';

    DataService.login({
      email: $scope.loginForm.email,
      password: $scope.loginForm.password
    }).then(function(res) {
      establishSession({
        userId: res.userId,
        name: res.name,
        email: res.email,
        goal: res.goal,
        weight: res.weight,
        height: res.height,
        age: res.age,
        activityLevel: res.activityLevel,
        bmi: res.bmi,
        calorieGoal: res.calorieGoal,
        proteinGoal: res.proteinGoal,
        targetWeight: res.targetWeight,
        token: res.token
      });
      if ($scope.$parent && $scope.$parent.showToast) {
        $scope.$parent.showToast('Welcome back, ' + res.name + '!', '✅');
      }
    }).catch(function(err) {
      $scope.authError = (err.data && err.data.error) ? err.data.error : 'Login failed. Please try again.';
    }).finally(function() {
      $scope.isBusy = false;
    });
  };

  $scope.register = function() {
    if (!$scope.registerForm.name || !$scope.registerForm.email || !$scope.registerForm.password || !$scope.registerForm.weightKg || !$scope.registerForm.heightCm || !$scope.registerForm.ageYears || !$scope.registerForm.activityLevel) {
      $scope.authError = 'Complete all registration fields to generate your profile.';
      return;
    }

    if (!$scope.emailPattern.test($scope.registerForm.email)) {
      $scope.authError = 'Enter a valid email address.';
      return;
    }

    if (!$scope.passwordPattern.test($scope.registerForm.password)) {
      $scope.authError = 'Password must be at least 8 characters and include a letter and a number.';
      return;
    }

    $scope.isBusy = true;
    $scope.authError = '';

    DataService.register({
      name: $scope.registerForm.name,
      email: $scope.registerForm.email,
      password: $scope.registerForm.password,
      goal: $scope.registerForm.goal,
      weightKg: $scope.registerForm.weightKg,
      heightCm: $scope.registerForm.heightCm,
      ageYears: $scope.registerForm.ageYears,
      activityLevel: $scope.registerForm.activityLevel
    }).then(function(res) {
      establishSession({
        userId: res.userId,
        name: res.name || $scope.registerForm.name,
        email: $scope.registerForm.email,
        goal: res.goal || $scope.registerForm.goal,
        weight: res.weight,
        height: res.height,
        age: res.age,
        activityLevel: res.activityLevel,
        bmi: res.bmi,
        calorieGoal: res.calorieGoal,
        proteinGoal: res.proteinGoal,
        targetWeight: res.targetWeight,
        token: res.token
      });
      if ($scope.$parent && $scope.$parent.showToast) {
        $scope.$parent.showToast('Account created. You are now signed in.', '🎉');
      }
    }).catch(function(err) {
      $scope.authError = (err.data && err.data.error) ? err.data.error : 'Registration failed. Please try again.';
    }).finally(function() {
      $scope.isBusy = false;
    });
  };
});


// ============================================================
//  HOME CONTROLLER — Dashboard overview
// ============================================================
app.controller('HomeCtrl', function($scope, DataService, $location) {

  DataService.loadCurrentUserData().then(function() {
    $scope.stats = DataService.getTodayStats();
    $scope.recentWorkouts = DataService.getWorkoutsLocal().slice(0, 5);
  });

  $scope.stats   = DataService.getTodayStats();
  $scope.weekPlan = DataService.getWeeklyPlan();

  // Calculate weekly ring progress (% of goal days completed)
  var completedDays = $scope.weekPlan.filter(function(d){ return d.group !== 'REST'; }).length;
  $scope.weekProgress = Math.round((completedDays / 5) * 100);

  // SVG ring helper - define function before using it
  $scope.calcRingOffset = function(pct, r) {
    var c = 2 * Math.PI * r;
    return c - (pct / 100) * c;
  };

  $scope.ringCircumference = 2 * Math.PI * 54;
  $scope.ringOffset = $scope.calcRingOffset($scope.weekProgress, 54);

  $scope.recentWorkouts = DataService.getWorkoutsLocal().slice(0, 5);

  // Time greeting
  $scope.timeGreeting = function() {
    var h = new Date().getHours();
    if (h < 12) return 'MORNING';
    if (h < 17) return 'AFTERNOON';
    return 'EVENING';
  };

  // Navigation helper
  $scope.goTo = function(path) {
    $location.path(path);
  };
});


// ============================================================
//  WORKOUT CONTROLLER (The Forge)
// ============================================================
app.controller('WorkoutCtrl', function($scope, DataService) {

  // Load seed data into local scope
  DataService.loadCurrentUserData().then(function() {
    $scope.workouts = DataService.getWorkoutsLocal();
  });
  $scope.workouts = DataService.getWorkoutsLocal();

  // Available muscle groups for dropdown
  $scope.categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  // Form model (empty initially)
  $scope.newWorkout = {
    name: '',
    category: 'Chest',
    sets: 3,
    reps: 10,
    weight: 0,
    intensity: 'medium',
    date: new Date().toISOString().split('T')[0]
  };

  $scope.weekPlan = DataService.getWeeklyPlan();
  $scope.editingWorkoutId = null;
  $scope.editWorkoutForm = null;

  function refreshWorkouts() {
    $scope.workouts = DataService.getWorkoutsLocal();
  }

  $scope.startEditWorkout = function(workout) {
    $scope.editingWorkoutId = workout.id;
    $scope.editWorkoutForm = angular.copy(workout);
  };

  $scope.cancelEditWorkout = function() {
    $scope.editingWorkoutId = null;
    $scope.editWorkoutForm = null;
  };

  $scope.saveWorkoutEdit = function() {
    if (!$scope.editWorkoutForm || !$scope.editWorkoutForm.name) return;

    DataService.updateWorkout($scope.editWorkoutForm).then(function() {
      refreshWorkouts();
      $scope.cancelEditWorkout();
      $scope.$parent.showToast('Workout updated', '✏️');
    });
  };

  // Add a workout to local array
  $scope.addWorkout = function() {
    if (!$scope.newWorkout.name) return;

    // Create workout object (mimics what comes back from API)
    var workout = {
      id: Date.now(),
      name: $scope.newWorkout.name,
      category: $scope.newWorkout.category,
      sets: parseInt($scope.newWorkout.sets),
      reps: parseInt($scope.newWorkout.reps),
      weight: parseFloat($scope.newWorkout.weight),
      intensity: $scope.newWorkout.intensity,
      date: $scope.newWorkout.date
    };

    // DataService.addWorkout returns a promise (simulated)
    DataService.addWorkout(workout).then(function() {
      refreshWorkouts();
      // Reset form
      $scope.newWorkout = {
        name: '',
        category: 'Chest',
        sets: 3,
        reps: 10,
        weight: 0,
        intensity: 'medium',
        date: new Date().toISOString().split('T')[0]
      };
      $scope.$parent.showToast('Workout logged successfully!', '💪');
    });
  };

  // Delete workout
  $scope.deleteWorkout = function(id) {
    var confirmed = confirm('Are you sure you want to delete this workout log?');
    if (!confirmed) return;
    
    DataService.deleteWorkout(id).then(function() {
      refreshWorkouts();
      $scope.$parent.showToast('Workout deleted', '🗑️');
    });
  };

  // Mark as done (just updates date to today for demo)
  $scope.markDone = function(workout) {
    workout.date = new Date().toISOString().split('T')[0];
    $scope.$parent.showToast('Marked as done today!', '✅');
  };
});


// ============================================================
//  NUTRITION CONTROLLER (The Fuel)
// ============================================================
app.controller('NutritionCtrl', function($scope, DataService) {

  DataService.loadCurrentUserData().then(function() {
    $scope.meals = DataService.getMealsLocal();
  });
  $scope.meals = DataService.getMealsLocal();
  $scope.mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'];

  // Form model
  $scope.newMeal = {
    name: '',
    type: 'Lunch',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: new Date().toISOString().split('T')[0]
  };
  $scope.editingMealId = null;
  $scope.editMealForm = null;

  function refreshMeals() {
    $scope.meals = DataService.getMealsLocal();
  }

  $scope.startEditMeal = function(meal) {
    $scope.editingMealId = meal.id;
    $scope.editMealForm = angular.copy(meal);
  };

  $scope.cancelEditMeal = function() {
    $scope.editingMealId = null;
    $scope.editMealForm = null;
  };

  $scope.saveMealEdit = function() {
    if (!$scope.editMealForm || !$scope.editMealForm.name) return;

    DataService.updateMeal($scope.editMealForm).then(function() {
      refreshMeals();
      $scope.cancelEditMeal();
      $scope.$parent.showToast('Meal updated', '✏️');
    });
  };

  // Calculate daily totals
  function updateTotals() {
    var totals = $scope.meals.reduce(function(acc, meal) {
      acc.calories += meal.calories;
      acc.protein  += meal.protein;
      acc.carbs    += meal.carbs;
      acc.fat      += meal.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    $scope.totals = totals;

    // Calculate macro percentages
    var totalGrams = totals.protein + totals.carbs + totals.fat;
    $scope.macroRings = {
      protein: totalGrams ? Math.round((totals.protein / totalGrams) * 100) : 0,
      carbs:   totalGrams ? Math.round((totals.carbs / totalGrams) * 100) : 0,
      fat:     totalGrams ? Math.round((totals.fat / totalGrams) * 100) : 0,
    };

    // Progress bars %
    var calorieGoal = Number($scope.user.calorieGoal || 0);
    var proteinGoal = Number($scope.user.proteinGoal || 0);
    $scope.calProgress = calorieGoal > 0
      ? Math.min(($scope.totals.calories / calorieGoal) * 100, 100)
      : 0;
    $scope.proteinProgress = proteinGoal > 0
      ? Math.min(($scope.totals.protein / proteinGoal) * 100, 100)
      : 0;
  }

  // Watch meals array for changes
  $scope.$watch('meals', updateTotals, true);

  // Add meal
  $scope.addMeal = function() {
    if (!$scope.newMeal.name) return;

    var meal = {
      id: Date.now(),
      name: $scope.newMeal.name,
      type: $scope.newMeal.type,
      calories: parseInt($scope.newMeal.calories),
      protein:  parseInt($scope.newMeal.protein),
      carbs:    parseInt($scope.newMeal.carbs),
      fat:      parseInt($scope.newMeal.fat),
      date: $scope.newMeal.date
    };

    DataService.addMeal(meal).then(function() {
      refreshMeals();
      $scope.newMeal = {
        name: '',
        type: 'Lunch',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: new Date().toISOString().split('T')[0]
      };
      $scope.$parent.showToast('Meal logged! Great nutrition!', '🥗');
    });
  };

  // Delete meal
  $scope.deleteMeal = function(id) {
    var confirmed = confirm('Are you sure you want to delete this meal log?');
    if (!confirmed) return;
    
    DataService.deleteMeal(id).then(function() {
      refreshMeals();
      $scope.$parent.showToast('Meal deleted', '🗑️');
    });
  };

  // SVG ring helper
  $scope.calcRingOffset = function(pct, r) {
    var c = 2 * Math.PI * r;
    return c - (pct / 100) * c;
  };

  // Try fetch tip from server, fall back to local
  DataService.getDailyTip().then(function(res) {
    $scope.nutritionTip = res.tip;
  }).catch(function() {
    $scope.nutritionTip = 'Focus on protein - aim for 1.6-2.2g per kg of bodyweight for muscle growth. Spread your protein intake across 4-5 meals for optimal absorption.';
  });
});


// ============================================================
//  PROGRESS CONTROLLER
// ============================================================
app.controller('ProgressCtrl', function($scope, DataService) {

  DataService.loadCurrentUserData().then(function() {
    $scope.workouts = DataService.getWorkoutsLocal();
    $scope.meals    = DataService.getMealsLocal();
    updateCharts();
  });

  $scope.workouts = DataService.getWorkoutsLocal();
  $scope.meals    = DataService.getMealsLocal();

  function updateCharts() {
    $scope.workouts = DataService.getWorkoutsLocal();
    $scope.meals    = DataService.getMealsLocal();

    // Group workouts by category for simple bar display
    var catMap = {};
    $scope.workouts.forEach(function(w) {
      catMap[w.category] = (catMap[w.category] || 0) + 1;
    });
    $scope.categoryData = Object.keys(catMap).map(function(k) {
      return { label: k, count: catMap[k] };
    });

    $scope.maxCount = Math.max.apply(null, $scope.categoryData.map(function(d){ return d.count; })) || 1;

    // Weekly workout count (last 7 entries)
    $scope.weeklyWorkouts = $scope.workouts.slice(0, 7);

    // Stats
    $scope.totalWorkouts = $scope.workouts.length;
    $scope.totalMeals    = $scope.meals.length;
    $scope.avgCalories   = $scope.meals.length
      ? Math.round($scope.meals.reduce(function(s,m){ return s+m.calories; },0) / $scope.meals.length)
      : 0;
  }

  updateCharts();
});


// ============================================================
//  LOGS CONTROLLER — Full history table
// ============================================================
app.controller('LogsCtrl', function($scope, DataService, $filter) {

  DataService.loadCurrentUserData().then(function() {
    refreshLogs();
  });

  function refreshLogs() {
    $scope.workoutLogs = DataService.getWorkoutsLocal();
    $scope.mealLogs    = DataService.getMealsLocal();
  }

  $scope.workoutLogs = DataService.getWorkoutsLocal();
  $scope.mealLogs    = DataService.getMealsLocal();

  $scope.activeTab   = 'workouts';
  $scope.sortField   = 'date';
  $scope.sortReverse = true;
  $scope.searchQuery = '';
  $scope.editingWorkoutId = null;
  $scope.editWorkoutForm = null;
  $scope.editingMealId = null;
  $scope.editMealForm = null;

  $scope.setTab = function(tab) { $scope.activeTab = tab; };

  $scope.startEditWorkout = function(workout) {
    $scope.editingWorkoutId = workout.id;
    $scope.editWorkoutForm = angular.copy(workout);
  };

  $scope.cancelEditWorkout = function() {
    $scope.editingWorkoutId = null;
    $scope.editWorkoutForm = null;
  };

  $scope.startEditMeal = function(meal) {
    $scope.editingMealId = meal.id;
    $scope.editMealForm = angular.copy(meal);
  };

  $scope.cancelEditMeal = function() {
    $scope.editingMealId = null;
    $scope.editMealForm = null;
  };

  $scope.saveWorkoutEdit = function() {
    if (!$scope.editWorkoutForm || !$scope.editWorkoutForm.name) return;

    DataService.updateWorkout($scope.editWorkoutForm).then(function() {
      refreshLogs();
      $scope.cancelEditWorkout();
      $scope.$parent.showToast('Workout updated', '✏️');
    });
  };

  $scope.saveMealEdit = function() {
    if (!$scope.editMealForm || !$scope.editMealForm.name) return;

    DataService.updateMeal($scope.editMealForm).then(function() {
      refreshLogs();
      $scope.cancelEditMeal();
      $scope.$parent.showToast('Meal updated', '✏️');
    });
  };

  // $filter (inbuilt service) used in template: | filter:searchQuery | orderBy:sortField
  $scope.setSortField = function(field) {
    if ($scope.sortField === field) {
      $scope.sortReverse = !$scope.sortReverse;
    } else {
      $scope.sortField = field;
      $scope.sortReverse = true;
    }
  };

  $scope.deleteLog = function(type, id) {
    var itemType = type === 'workout' ? 'workout' : 'meal';
    var confirmed = confirm('Are you sure you want to delete this ' + itemType + ' log?');
    if (!confirmed) return;
    
    if (type === 'workout') {
      DataService.deleteWorkout(id).then(function(){
        refreshLogs();
        $scope.$parent.showToast('Log deleted', '🗑️');
      });
    } else {
      DataService.deleteMeal(id).then(function(){
        refreshLogs();
        $scope.$parent.showToast('Log deleted', '🗑️');
      });
    }
  };
});
