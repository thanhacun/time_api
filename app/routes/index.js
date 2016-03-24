'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
	function isValidDate(d) {
		//Source: http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
		if (Object.prototype.toString.call(d) !== "[object Date]") {
			return false;
		} else {
			return !isNaN(d.getTime());
		}
	}
		
	app.route('/:timestring')
		.get(function(req, res) {
			var dateString = req.params['timestring'];
			if (!isNaN(Number(dateString))) {
				//May be unix timestamp
				dateString = Number(dateString) * 1000;
			}
			var currentDate = new Date(dateString);
			if (isValidDate(currentDate)) {
				res.json({
					'unix': currentDate.valueOf() / 1000,
					'nature': currentDate.toDateString()
				});	
			} else {
				res.json({
					'unix': null,
					'nature': null
				});
			}
			
		});
};
