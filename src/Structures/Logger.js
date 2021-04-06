/* eslint-disable no-process-env */
/* eslint-disable func-names */
const {
	blueBright,
	cyanBright,
	greenBright,
	grey,
	magenta,
	magentaBright,
	redBright,
	yellow
} = require('chalk');
const { token } = require('../../config.json');

if (!String.prototype.splice) {
	String.prototype.splice = function (i, r, s) {
		return this.slice(0, i) + s + this.slice(i + Math.abs(r));
	};
}

function pad(value, digits) {
	while (value.toString().length < digits) value = `0${value}`;
	return value;
}

function format(d) {
	return `${pad(d.getDate(), 2)}/${pad(d.getMonth() + 1, 2)}/${d.getFullYear().toString().splice(0, 2, '')} || ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}`;
}

function typeName(type, color) {
	switch (type) {
		case 'warn':
			return color ? yellow('WRN') : 'WRN';
		case 'error':
			return color ? redBright('ERR') : 'ERR';
		case 'debug':
			return color ? magenta('DBG') : 'DBG';
		case 'msg':
			return color ? magentaBright('MSG') : 'MSG';
		case 'cmd':
			return color ? cyanBright('CMD') : 'CMD';
		case 'ready':
			return color ? greenBright('RDY') : 'RDY';
		default:
			return color ? blueBright('LOG') : 'LOG';
	}
}

class Logger {

	constructor(client) {
		this.client = client;
	}

	static log(content, options = {}) {
		if (typeof options === 'string') options = { type: options };
		if (!options.type) options.type = 'log';
		if (typeof content !== 'string') {
			if (typeof content === 'object' && Object.prototype.toString.call(content).match(/\[object (.+)]/)[1] === 'Error') {
				content = content.stack;
				options.type = 'error';
			} else {
				content = require('util').inspect(content, { depth: 1 });
			}
		}

		content = content.replace(new RegExp(process.env.PWD, 'g'), '.')
			.replace(new RegExp(token, 'g'), 'T0K3N');
		content.split('\n').forEach((sub) => {
			const date = `[${format(new Date(Date.now()))}]`,
				m = `${grey(date)}   ${typeName(options.type, true)}\t${sub}`;
			console.log(m);
		});
	}

	static error(...args) {
		this.log(...args, { type: 'error' });
	}
	static warn(...args) {
		this.log(...args, { type: 'warn' });
	}
	static debug(...args) {
		this.log(...args, { type: 'debug' });
	}
	static cmd(...args) {
		this.log(...args, { type: 'cmd' });
	}
	static ready(...args) {
		this.log(...args, { type: 'ready' });
	}
	static msg(...args) {
		this.log(...args, { type: 'msg' });
	}

}

module.exports = Logger;
