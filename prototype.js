'use strict';

var benchmark = function(description, callback) {
    var start = new Date().getTime();
    for (var i = 0; i < 10000000; i++) {
        callback();
    }
    console.log(description + ' took: ' + (new Date().getTime() - start));
};

var Person = function (firstName, lastName) {
    var self = this;
    self.firstName = firstName;
    self.lastName = lastName;
    self.fullName = function () {
        return self.firstName + ' ' + self.lastName;
    };
};

var PersonNoFullName = function (firstName, lastName) {
    var self = this;
    self.firstName = firstName;
    self.lastName = lastName;
};

var getFullName = function (person) {
    return person.firstName + ' ' + person.lastName;
};

var PersonProto = function (firstName, lastName) {
    var self = this;
    self.firstName = firstName;
    self.lastName = lastName;
};

PersonProto.prototype.fullName = function () {
    return this.firstName + ' ' + this.lastName;
};

// Example benchmarks proto vs. no proto.
console.log('Example benchmarks proto vs. no proto.');
benchmark('Full name', function () {
    var p = new Person('Sander', 'Rossel');
    var n = p.fullName();
});

benchmark('No full name', function () {
    var p = new PersonNoFullName('Sander', 'Rossel');
    var n = getFullName(p);
});

benchmark('Proto full name', function () {
    var p = new PersonProto('Sander', 'Rossel');
    var n = p.fullName();
});

// Examples using invoke context.
console.log('');
console.log('Examples using invoke context.');
var p = new PersonProto('Sander', 'Rossel');
console.log(p.fullName());
// This will break.
// 'this' in prototype is context dependent.
/*
var fn = p.fullName;
console.log(fn());
*/

var p = new Person('Sander', 'Rossel');
console.log(p.fullName());
var fn = p.fullName;
console.log(fn());

// Examples using delete.
console.log('');
console.log('Examples using delete.');
var p = new PersonProto('Sander', 'Rossel');
delete p.fullName;
console.log(p.fullName());
p.fullName = undefined;
console.log(p.fullName);

// This will break.
// fullName is no longer defined after a delete.
/*
var p = new Person('Sander', 'Rossel');
delete p.fullName;
console.log(p.fullName());
*/

// Example using static prototype property.
console.log('');
console.log('Example using static prototype property.');
PersonProto.prototype.friends = [];
var p1 = new PersonProto('Sander', 'Rossel');
var p2 = new PersonProto('Bill', 'Gates');
p1.friends.push(p2);
console.log(p1.friends[0].fullName() + ' is a friend of ' + p1.fullName());
console.log(p2.friends[0].fullName() + ' is a friend of ' + p2.fullName());

// Examples using inheritance.
console.log('');
console.log('Examples using inheritance.');
var Employee = function (firstName, lastName, salary) {
    var self = this;
    self.firstName = firstName;
    self.lastName = lastName;
    self.salary = salary;
};

// This is no good!
/*
Employee.prototype = PersonProto.prototype;
var e = new Employee('Sander', 'Rossel', 1000000);
console.log(e.getSalary());

var p = new PersonProto('Sander', 'Rossel');
console.log(p.getSalary());
*/

// This is better!
var Temp = function () {};
Temp.prototype = PersonProto.prototype;
Employee.prototype = new Temp();
Employee.prototype.constructor = Employee;

// Reusable function.
/*
var inherit = function (inheritor, inherited) {
    var Temp = function () {};
    Temp.prototype = inherited.prototype;
    inheritor.prototype = new Temp();
    inheritor.prototype.constructor = inheritor;
};
inherit(Employee, PersonProto);
*/

Employee.prototype.getSalary = function () {
    return this.fullName() + ' earns ' + this.salary;
};

var e = new Employee('Sander', 'Rossel', 1000000); // I wish :-)
console.log(e.getSalary());

// This won't work now.
/*
var p = new PersonProto('Sander', 'Rossel');
console.log(p.getSalary());
*/

if (e instanceof Employee) {
    console.log('e is an instance of Employee.');    
}

if (e instanceof PersonProto) {
    console.log('e is an instance of PersonProto.');
}

// Examples using Object.create.
console.log('');
console.log('Examples using Object.create.');
var o = Object.create(PersonProto.prototype);
o.firstName = 'Sander';
o.lastName = 'Rossel';
console.log(o.fullName());

if (o instanceof PersonProto) {
    console.log('o is an instance of PersonProto.');
}

var Employee2 = function (firstName, lastName, salary) {
    var self = this;
    self.firstName = firstName;
    self.lastName = lastName;
    self.salary = salary;
};

Employee2.prototype = Object.create(PersonProto.prototype);
Employee2.prototype.constructor = Employee2;

Employee2.prototype.getSalary = function () {
    return this.fullName() + ' earns ' + this.salary;
};

var e = new Employee2('Sander', 'Rossel', 1000000); // I wish :-)
console.log(e.getSalary());

// This still won't work.
/*
var p = new PersonProto('Sander', 'Rossel');
console.log(p.getSalary());
*/

if (e instanceof Employee2) {
    console.log('e is an instance of Employee2.');    
}

if (e instanceof PersonProto) {
    console.log('e is an instance of PersonProto.');
}

// Examples on __proto__.
console.log('');
console.log('Examples on __proto__.');
var p = {
    firstName: 'Sander',
    lastName: 'Rossel'
};

if (p.__proto__ === Object.prototype) {
    console.log('__proto__ points to the constructors prototype.');
}

// Highly discouraged!
p.__proto__.fullName = function () {
    return this.firstName + ' ' + this.lastName;
};

console.log(p.fullName());
delete p.fullName;
console.log(p.fullName());

var i = 10;
console.log(i.fullName());