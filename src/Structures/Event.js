class Event {
  constructor(client, name, { once = false, emitter = client } = {}) {
    this.name = name;
    this.client = client;
    this.type = once ? 'once' : 'on';
    this.emitter = emitter;
  }

  // eslint-disable-next-line no-unused-vars
  async run(...args) {
    throw new Error(`The run method has not been implemented in ${this.name}`);
  }
}

export default Event;
