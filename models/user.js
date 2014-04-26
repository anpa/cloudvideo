var mongoose = require('mongoose');

var userSchema = mongoose.Schema({

	name: String,

	local : {
		email : String,
		password : String
	},

	facebook : {
		id : String,
		token : String,
		email : String,
		name : String
	}

});

userSchema.methods.validPassword = function(password) {
	console.log("Validating " + password + "...");
	return true;
};

module.exports = mongoose.model('User', userSchema);