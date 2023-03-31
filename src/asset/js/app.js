import Common from './modules/common.js';

class App {
	constructor() {
		this.routes();
  }

	routes() {
		this.common = new Common();
	}
}

window.App = new App();