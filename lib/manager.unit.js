'use strict';

describe('Manager', function() {
	var noop = function noop() {};
	var Manager = require('./manager');

	afterEach(function() {
		Manager.removeAll();
	});

	describe('add', function() {
		it('should create an instance', function() {
			Manager.add('foo');
			Manager.add('bar');

			expect(Manager.getAll()).to.contain.all.keys(['foo', 'bar']);
		});

		it('should memoize an existing instance', function() {
			var foo1 = Manager.add('foo');
			var foo2 = Manager.add('foo');

			var bar1 = Manager.add('bar');
			var bar2 = Manager.add('bar');

			expect(foo1).to.equal(foo2);
			expect(bar1).to.equal(bar2);
		});

		it('should not create an instance if an `id` is not a `String`', function() {
			Manager.add({ foo: 'bar' });
			Manager.add(noop);
			Manager.add(['foo', 'bar']);
			Manager.add(9);

			expect(Manager.getAll()).to.be.empty;
		});
	});

	describe('remove', function() {
		it('should remove an instance', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.baz', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.baz', noop);

			Manager.remove('foo');
			Manager.remove('bar');

			expect(Manager.getAll()).to.be.empty;
		});

		it('should not remove an instance with an unknown `id`', function() {
			Manager.add('foo');
			Manager.add('bar');

			Manager.remove('abar');
			Manager.remove('afoo');

			expect(Manager.getAll()).to.include.all.keys(['foo', 'bar']);
		});
	});

	describe('removeAll', function() {
		it('should remove all instances', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.baz', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.baz', noop);

			Manager.removeAll();

			expect(Manager.getAll()).to.be.empty;
		});
	});

	describe('size', function() {
		it('should return the length of all instances', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.baz', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.baz', noop);

			expect(Manager.size()).to.equal(2);
		});
	});

	describe('get', function() {
		it('should get an instance', function() {
			Manager.add('foo');
			Manager.add('bar');

			expect(Manager.get('foo')).to.contain.all.keys(['id', 'nextGuid', 'listeners']);
			expect(Manager.get('bar')).to.contain.all.keys(['id', 'nextGuid', 'listeners']);
		});

		it('should not get an instance with an unknown `id`', function() {
			expect(Manager.get('foo')).to.be.undefined;
		});
	});

	describe('getAll', function() {
		it('should get all instances', function() {
			Manager.add('foo');
			Manager.add('bar');

			expect(Manager.getAll()).to.contain.all.keys(['foo', 'bar']);
		});

		it('should return an empty object when no instances are present', function() {
			expect(Manager.getAll()).to.be.empty;
		});
	});

	describe('on', function() {
		it('should register an event listener', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.baz', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.baz', noop)
				.on('bar', 'bar.baz', noop);

			expect(Manager.get('foo').listeners['foo.bar']).to.have.length(2);
			expect(Manager.get('foo').listeners['foo.bar'].dispatcher).to.be.a('function');
			expect(Manager.get('foo').listeners['foo.baz']).to.have.length(1);
			expect(Manager.get('foo').listeners['foo.baz'].dispatcher).to.be.a('function');
			expect(Manager.get('foo').listeners['foo.boo']).to.not.exist;

			expect(Manager.get('bar').listeners['bar.bar']).to.have.length(1);
			expect(Manager.get('bar').listeners['bar.baz'].dispatcher).to.be.a('function');
			expect(Manager.get('bar').listeners['bar.baz']).to.have.length(2);
			expect(Manager.get('bar').listeners['bar.baz'].dispatcher).to.be.a('function');
		});

		it('should not register an event listener with an unknown `id`', function() {
			Manager.add('foo')
				.on('foobar', 'foobar.foo', noop);

			Manager.add('bar')
				.on('barfoo', 'barfoo.bar', noop);

			expect(Manager.get('foo').listeners).to.be.empty;
			expect(Manager.get('bar').listeners).to.be.empty;
		});
	});

	describe('off', function() {
		it('should unregister all event listeners', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.bar', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.bar', noop);

			Manager.off('foo', 'foo.bar');
			Manager.off('bar', 'bar.bar');

			expect(Manager.get('foo').listeners['foo.bar']).to.be.undefined;
			expect(Manager.get('foo').listeners['foo.bar']).to.be.undefined;

			expect(Manager.get('bar').listeners['bar.bar']).to.be.undefined;
			expect(Manager.get('bar').listeners['bar.bar']).to.be.undefined;
		});

		it('should unregister an event listener', function() {
			var listener1 = function listener1() {};
			var listener2 = function listener2() {};

			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.bar', listener1)
				.on('foo', 'foo.bar', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.bar', listener2)
				.on('bar', 'bar.bar', noop);

			Manager.off('foo', 'foo.bar', listener1);
			Manager.off('bar', 'bar.bar', listener2);

			expect(Manager.get('foo').listeners['foo.bar']).to.have.length(2);
			expect(Manager.get('foo').listeners['foo.bar'][1].guid).to.not.equal(listener1.guid);
			expect(Manager.get('foo').listeners['foo.bar'].dispatcher).to.be.a('function');

			expect(Manager.get('bar').listeners['bar.bar']).to.have.length(2);
			expect(Manager.get('bar').listeners['bar.bar'][1].guid).to.not.equal(listener2.guid);
			expect(Manager.get('bar').listeners['bar.bar'].dispatcher).to.be.a('function');
		});

		it('should not unregister an event listener with an unknown `id`', function() {
			Manager.add('foo')
				.on('foo', 'foo.bar', noop);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop);

			Manager.off('foobar', 'foo.bar');
			Manager.off('barbar', 'bar.bar');

			expect(Manager.get('foo').listeners['foo.bar']).to.have.length(1);
			expect(Manager.get('bar').listeners['bar.bar']).to.have.length(1);
		});
	});

	describe('emit', function() {
		it('should emit an event to listeners', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();
			var listener3 = sinon.spy();
			var listener4 = sinon.spy();

			var eventOrigin = window.location.href;
			var symbol = 'postit';

			var fooEvent = {
				dataParsed: {
					foo: 'bar',
					__postit: symbol,
					__event: 'foo.bar',
					__id: 'foo',
					__origin: eventOrigin
				}
			};

			var barEvent = {
				dataParsed: {
					bar: 'bar',
					__postit: symbol,
					__event: 'bar.bar',
					__id: 'bar',
					__origin: eventOrigin
				}
			};

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1)
				.on('foo', 'foo.bar', listener2);

			Manager.add('bar')
				.on('bar', 'bar.bar', listener3)
				.on('bar', 'bar.bar', listener4);

			Manager.emit('foo', 'foo.bar', window.self, { foo: 'bar' }, '*');
			Manager.emit('bar', 'bar.bar', window.self, { bar: 'bar' }, '*');
			window.self.postMessage('foo', '*');

			setTimeout(function() {
				var listener1Args = listener1.args[0][0];
				var listener2Args = listener2.args[0][0];
				var listener3Args = listener3.args[0][0];
				var listener4Args = listener4.args[0][0];

				expect(listener1.calledOnce).to.be.true;
				expect(listener1Args.dataParsed).to.deep.equal(fooEvent.dataParsed);

				expect(listener2.calledOnce).to.be.true;
				expect(listener2Args.dataParsed).to.deep.equal(fooEvent.dataParsed);

				expect(listener3.calledOnce).to.be.true;
				expect(listener3Args.dataParsed).to.deep.equal(barEvent.dataParsed);

				expect(listener4.calledOnce).to.be.true;
				expect(listener4Args.dataParsed).to.deep.equal(barEvent.dataParsed);

				listener1.reset();
				listener2.reset();
				listener3.reset();
				listener4.reset();
				done();
			}, 1);
		});

		it('should emit an event to all listeners', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', noop)
				.on('foo', 'foo.baz', noop)
				.on('foo', '*', listener1);

			Manager.add('bar')
				.on('bar', 'bar.bar', noop)
				.on('bar', 'bar.baz', noop)
				.on('bar', '*', listener2);

			Manager.emit('foo', 'foo.bar', window.self, { foo: 'bar' }, '*');
			Manager.emit('foo', 'foo.baz', window.self, { foo: 'baz' }, '*');

			Manager.emit('bar', 'bar.bar', window.self, { bar: 'bar' }, '*');
			Manager.emit('bar', 'bar.baz', window.self, { bar: 'baz' }, '*');
			window.self.postMessage('foo', '*');

			setTimeout(function() {
				var listener1Args1 = listener1.args[0][0];
				var listener1Args2 = listener1.args[1][0];

				var listener2Args1 = listener2.args[0][0];
				var listener2Args2 = listener2.args[1][0];

				expect(listener1Args1.dataParsed.foo).to.equal('bar');
				expect(listener1Args2.dataParsed.foo).to.equal('baz');
				expect(listener1.callCount).to.equal(2);

				expect(listener2Args1.dataParsed.bar).to.equal('bar');
				expect(listener2Args2.dataParsed.bar).to.equal('baz');
				expect(listener2.callCount).to.equal(2);

				listener1.reset();
				listener2.reset();
				done();
			}, 1);
		});

		it('should not emit an event to removed listeners', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1)
				.off('foo', 'foo.bar');

			Manager.add('bar')
				.on('bar', 'bar.bar', listener2)
				.off('bar', 'bar.bar');

			Manager.emit('foo', 'foo.bar', window.self, { foo: 'bar' }, '*');
			Manager.emit('bar', 'bar.bar', window.self, { bar: 'bar' }, '*');

			setTimeout(function() {
				expect(listener1.calledOnce).to.be.false;
				expect(listener2.calledOnce).to.be.false;
				expect(Manager.get('foo').listeners['foo.bar']).to.be.undefined;

				listener1.reset();
				listener2.reset();
				done();
			}, 1);
		});

		it('should normalize the `message` sent message', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();
			var listener3 = sinon.spy();
			var listener4 = sinon.spy();
			var listener5 = sinon.spy();
			var listener6 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1)
				.on('foo', 'foo.baz', listener2)
				.on('foo', 'foo.boo', listener3);

			Manager.add('bar')
				.on('bar', 'bar.bar', listener4)
				.on('bar', 'bar.baz', listener5)
				.on('bar', 'bar.boo', listener6);

			Manager.emit('foo', 'foo.bar', window.self, { foo: 'bar' }, '*');
			Manager.emit('foo', 'foo.baz', window.self, 'foobar', '*');
			Manager.emit('foo', 'foo.boo', window.self, [0, 1, 2], '*');

			Manager.emit('bar', 'bar.bar', window.self, { bar: 'bar' }, '*');
			Manager.emit('bar', 'bar.baz', window.self, 'barbar', '*');
			Manager.emit('bar', 'bar.boo', window.self, [0, 1, 2], '*');

			setTimeout(function() {
				var listener1Args = listener1.args[0][0];
				var listener2Args = listener2.args[0][0];
				var listener3Args = listener3.args[0][0];
				var listener4Args = listener4.args[0][0];
				var listener5Args = listener5.args[0][0];
				var listener6Args = listener6.args[0][0];

				expect(listener1Args.dataParsed.foo).to.equal('bar');
				expect(listener2Args.dataParsed.__value).to.equal('foobar');
				expect(listener3Args.dataParsed.__value).to.have.members([0, 1, 2]);

				expect(listener4Args.dataParsed.bar).to.equal('bar');
				expect(listener5Args.dataParsed.__value).to.equal('barbar');
				expect(listener6Args.dataParsed.__value).to.have.members([0, 1, 2]);

				listener1.reset();
				listener2.reset();
				listener3.reset();
				listener4.reset();
				listener5.reset();
				listener6.reset();
				done();
			}, 1);
		});

		it('should not emit an event that has a `message` type of `Function`', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1);

			Manager.add('bar')
				.on('bar', 'bar.bar', listener2);

			Manager.emit('foo', 'foo.bar', window.self, noop, '*');
			Manager.emit('bar', 'bar.bar', window.self, noop, '*');

			setTimeout(function() {
				expect(listener1.calledOnce).to.be.false;
				expect(listener2.calledOnce).to.be.false;

				listener1.reset();
				listener2.reset();
				done();
			}, 1);
		});

		it('should not emit an event with an unknown `id`', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1);

			Manager.add('bar')
				.on('bar', 'bar.bar', listener2);

			Manager.emit('foobar', 'foo.bar', window.self, { foo: 'bar' }, '*');
			Manager.emit('barbar', 'bar.bar', window.self, { bar: 'bar' }, '*');

			setTimeout(function() {
				expect(listener1.calledOnce).to.be.false;
				expect(listener2.calledOnce).to.be.false;

				listener1.reset();
				listener2.reset();
				done();
			}, 1);
		});

		it('should not emit an event to an origin that does not match', function(done) {
			var listener1 = sinon.spy();
			var listener2 = sinon.spy();

			Manager.add('foo')
				.on('foo', 'foo.bar', listener1);

			Manager.add('bar')
				.on('bar', 'bar.bar', listener2);

			Manager.emit('foo', 'foo.bar', window.self, { foo: 'bar' }, 'http://www.foobarbaz.com');
			Manager.emit('bar', 'bar.bar', window.self, { bar: 'bar' }, 'http://www.foobarbaz.com');

			setTimeout(function() {
				expect(listener1.calledOnce).to.be.false;
				expect(listener2.calledOnce).to.be.false;

				listener1.reset();
				listener2.reset();
				done();
			}, 1);
		});
	});

	describe('openWindow', function() {
		it('should open a new `window`', function() {
			var openWindow = Manager.openWindow('http://www.foo.com', 'foo', {
				width: 700,
				height: 700
			});

			expect(openWindow).not.to.be.null;
		});
	});
});
