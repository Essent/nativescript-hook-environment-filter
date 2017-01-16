var Observable = require("data/observable").Observable;
var config = require('config');

function getMessage(counter) {
	if (counter <= 0) {
		return "Hoorraaay! You unlocked the NativeScript clicker achievement!";
	} else {
		return counter + " taps left";
	}
}

function createViewModel() {
	console.log('config env: ' + config.env);
	var viewModel = new Observable();
	viewModel.counter = 42;
	viewModel.message = getMessage(viewModel.counter);

	viewModel.onTap = function () {
		this.counter--;
		this.set("message", getMessage(this.counter));
	}

	return viewModel;
}

exports.createViewModel = createViewModel;
