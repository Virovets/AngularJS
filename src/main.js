var app = angular.module('myApp', []);

app.service('UserService', function() {
    this.getUsersFromSessionStorage = function() {
        var users = JSON.parse(sessionStorage.getItem('users'));
        return users || [];
    };

    this.saveUsersToSessionStorage = function(users) {
        sessionStorage.setItem('users', JSON.stringify(users));
    };
});

app.controller('UserController', function($scope, UserService, $timeout) {
    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.passwordsNotMatch = false;
    const defUsers = [
        {
            username: 'Test',
            first_name: 'Name',
            last_name: 'Last',
            id: 1,
            email: 'test@gmail.com',
            password: 'Testpas123',
            confirmPassword: 'Testpas123',
            user_type: 'Admin'
        }
    ];
    UserService.saveUsersToSessionStorage(defUsers);
    function updateUsersList() {
        $scope.userList = UserService.getUsersFromSessionStorage();
    }

    updateUsersList();
    $scope.newUser = {};
    $scope.showForm = false;
    $scope.isFormInvalid = false;
    $scope.showCreateUserForm = function() {
        $scope.userForm.$$controls.forEach(c => {
            c.$dirty = false;
        })
        $scope.newUser = {};
        $scope.showForm = true;
        $scope.isEditing = false;
    };

    $scope.createUser = function() {
        $scope.isFormInvalid = false;
        $scope.passwordsNotMatch = false;
        if ($scope.isEditing) {
            if ($scope.userForm.$valid) {
                const updatedUsers = $scope.userList.map(function(user) {
                    if (user.id === $scope.newUser.id) {
                        return {
                            ...$scope.newUser,
                            id: user.id
                        };
                    } else {
                        return user
                    }
                });
                UserService.saveUsersToSessionStorage(updatedUsers);
                $scope.newUser = {};
                updateUsersList();
                $scope.closeForm()
                $scope.showStatusPopup('success');
            } else {
                $scope.isFormInvalid = true;
                $scope.userForm.$$controls.forEach(c => {
                    c.$dirty = true;
                })
                $scope.showStatusPopup('error');
            }
        } else {
            if ($scope.userForm.$valid) {
                var userList = UserService.getUsersFromSessionStorage();
                userList.push(
                    {
                        ...$scope.newUser,
                        id: new Date().valueOf()
                    }

                );
                UserService.saveUsersToSessionStorage(userList);
                $scope.newUser = {};
                updateUsersList();
                $scope.closeForm()
                $scope.showStatusPopup('success');
            } else {
                $scope.showStatusPopup('error');
                $scope.isFormInvalid = true;
                $scope.userForm.$$controls.forEach(c => {
                    c.$dirty = true;
                })
                $scope.passwordsNotMatch = true;
            }
        }
    };

    $scope.showStatusPopup = function (popupType) {
        switch (popupType) {
            case 'success':
                if ($scope.showError) {
                    $scope.showError = false;
                }
                $scope.showSuccess = true;
                $timeout(() => $scope.showSuccess = false, 5000);
                break;
            case 'error':
                if ($scope.showSuccess) {
                    $scope.showSuccess = false;
                }
                $scope.showError = true;
                $timeout(() => $scope.showError = false, 5000);
                break;
        }
    }

    $scope.validateUsername = function(modelValue, viewValue) {
        var userList = UserService.getUsersFromSessionStorage();
        var existingUsernames = userList.map(function(user) {
            return user.username?.toLowerCase();
        });
        var username = viewValue?.toLowerCase();
        return existingUsernames.indexOf(username) === -1;
    };

    $scope.validateEmail = function(modelValue, viewValue) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(viewValue);
    };

    $scope.validatePassword = function(modelValue, viewValue) {
        var pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return pattern.test(viewValue);
    };

    $scope.validateConfirmPassword = function(modelValue, viewValue) {
        $scope.passwordsNotMatch = viewValue !== $scope.newUser.password;
        return viewValue === $scope.newUser.password;
    };

    $scope.validateRequired = function(modelValue, viewValue) {
        return !!viewValue;
    };

    $scope.deleteUser = function() {
        var userList = UserService.getUsersFromSessionStorage();
        for (var i = 0; i < userList.length; i++) {
            if (userList[i].id === $scope.newUser.id) {
                userList.splice(i, 1);
                UserService.saveUsersToSessionStorage(userList);
            }
        }
        $scope.closeForm();
        $scope.newUser = {};
        updateUsersList();
    };

    $scope.editUser = function(userObj) {
        const index = $scope.userList.findIndex(user => user.id === userObj.id);
        if (index !== -1) {
            $scope.newUser = angular.copy($scope.userList[index]);
            $scope.isFormInvalid = false;
            $scope.showForm = true;
            $scope.isEditing = true;
        }
    };

    $scope.closeForm = function () {
       $scope.userForm.$$controls.forEach(c => {
           c.$dirty = false;
       })
        $scope.showForm = false;
        $scope.isEditing = false;
        $scope.isFormInvalid = false;
    }
});

app.directive('customValidation', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$validators.customValidation = function(modelValue, viewValue) {
                var validationFunction = scope.$eval(attrs.customValidation);
                if (angular.isFunction(validationFunction)) {
                    return validationFunction(modelValue, viewValue);
                } else {
                    return true;
                }
            };
        }
    };
});
