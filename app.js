// ============================================================
//  COREMATRIX — app.js
//  AngularJS Module + SPA Routing (ngRoute)
//  Phase 2: SPA Routing with $routeProvider
// ============================================================

var app = angular.module('CoreMatrix', ['ngRoute']);

// ---- ROUTE CONFIGURATION ($routeProvider) ----
app.config(function($routeProvider, $locationProvider) {

  // Use hashbang mode for compatibility
  $locationProvider.hashPrefix('');

  $routeProvider

    // Home Dashboard
    .when('/', {
      templateUrl: 'home.html',
      controller:  'HomeCtrl'
    })

    // Login / Register
    .when('/auth', {
      templateUrl: 'auth.html',
      controller:  'AuthCtrl'
    })

    // The Forge — Workout Planner
    .when('/forge', {
      templateUrl: 'forge.html',
      controller:  'WorkoutCtrl'
    })

    // The Fuel — Nutrition Planner
    .when('/fuel', {
      templateUrl: 'fuel.html',
      controller:  'NutritionCtrl'
    })

    // Progress Charts
    .when('/progress', {
      templateUrl: 'progress.html',
      controller:  'ProgressCtrl'
    })

    // My Logs (all history)
    .when('/logs', {
      templateUrl: 'logs.html',
      controller:  'LogsCtrl'
    })

    // Redirect unknown routes back to home
    .otherwise({ redirectTo: '/' });
});
