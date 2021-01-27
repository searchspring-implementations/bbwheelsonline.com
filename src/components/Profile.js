// TODO move to components library

import { h, Component } from 'preact';

import { log, emoji, colors } from '@searchspring/snap-toolbox/logger';

export class Profile extends Component {
	constructor(props) {
		super(props);

		this.name = props.name;
		this.profiler = props.profiler;
		this.context = props.context;
		this.profile = this.createProfile();

		logComponent.creation({ name: this.name });
	}

	componentDidUpdate() {
		logComponent.change({ name: this.name, info: 'updated' });

		if (!this.timer.start) {
			this.timer.start = window.performance.now();
		}
	}

	shouldComponentUpdate() {
		this.profile = this.createProfile();
		logComponent.change({ name: this.name, info: 'update triggered' });
	}

	componentDidMount() {
		this.profile.stop();
		logComponent.render({ name: this.name, time: this.profile.time.run });
	}

	componentDidUpdate() {
		this.profile.stop();

		logComponent.render({ name: this.name, time: this.profile.time.run });
	}

	componentDidCatch(error) {
		logComponent.error({ name: this.name, error });
	}

	createProfile() {
		return this.profiler.create({ type: 'component', name: this.name, context: this.context }).start();
	}

	render() {
		return this.props.children;
	}
}

const logComponent = {
	creation: ({ name }) => {
		log.dev(
			`%c +  %c<${name}/>  %c::  %cCREATED`,
			`color: ${colors.orange}; font-weight: bold; font-size: 14px; line-height: 12px;`,
			`color: ${colors.orange};`,
			`color: ${colors.orangedark};`,
			`color: ${colors.orange}; font-weight: bold;`
		);
	},
	change: ({ name, info = 'changed' }) => {
		log.dev(
			`%c ${emoji.lightning}  %c<${name}/>  %c::  %c${info.toUpperCase()}`,
			`color: ${colors.orange}; font-weight: bold; font-size: 14px; line-height: 12px;`,
			`color: ${colors.orange};`,
			`color: ${colors.orangedark};`,
			`color: ${colors.orangedark}; font-weight: bold;`
		);
	},
	error: ({ name, error = 'component crash' }) => {
		log.dev(
			`%c ${emoji.bang}  %c<${name}/>  %c::  %cERROR  %c::  %c${error}`,
			`color: ${colors.red}`,
			`color: ${colors.red};`,
			`color: ${colors.orangedark};`,
			`color: ${colors.red}; font-weight: bold;`,
			`color: ${colors.orangedark};`,
			`color: ${colors.redlight};`
		);
	},
	render: ({ name, time }) => {
		log.dev(
			`%c ${emoji.magic}  %c<${name}/>  %c::  %cRENDERED  %c::  %c${time}ms`,
			`color: ${colors.orange};`,
			`color: ${colors.orange};`,
			`color: ${colors.orangedark};`,
			`color: ${colors.orangedark}; font-weight: bold;`,
			`color: ${colors.orangedark};`,
			`color: ${colors.grey};`
		);
	},
	removal: ({ name }) => {
		log.dev(
			`%c -  %c<${name}/>  %c::  %cREMOVED`,
			`color: ${colors.orange}; font-weight: bold; font-size: 14px; line-height: 12px;`,
			`color: ${colors.orange};`,
			`color: ${colors.orangedark};`,
			`color: ${colors.reddark}; font-weight: bold;`
		);
	},
};
