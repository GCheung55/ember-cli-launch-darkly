/**
 * @module Services
 *
 */
import { Promise } from 'rsvp';
import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { warn } from '@ember/debug';
import { run } from '@ember/runloop';
import ldclient from '@busy-web/ember-cli-launch-darkly/utils/launch-darkly-sdk';

export default Service.extend(Evented, {
  _client: null,
  isInitialized: false,

  initialize(id, user, options) {
    return new Promise(resolve => {
      this._client = ldclient(id, user, options);
      this._client.on('ready', () => {
        if (!this.get('isDestroyed')) {
          this.set('isInitialized', true);
          run(null, resolve, true);
        }
      });
    });
  },

	/**
	 * Send a `track` event to Launch Darkly
	 *
	 * @public
	 * @async
	 * @method track
	 */
	track(key, data) {
    if (!this.get('isInitialized')) {
      warn("<service:launch-darkly::track> was called before it was initialized");
    }

    return this._client.track(key, data);
	},

	/**
	 * Proxy the Launch Darkly client to call the allFlags() method
	 *
	 * @public
	 * @async
	 * @method allFlags
	 */
	allFlags() {
    if (!this.get('isInitialized')) {
      warn("<service:launch-darkly::allFlags> was called before it was initialized");
    }
		return this._client.allFlags();
	},

	/**
	 * Proxy the Launch Darkly client to call the variation() method
	 *
	 * @public
	 * @async
	 * @method getAllFlags
	 * @param {String} key the identifying key for the feature, in the format `time.freemium`
	 * @param {Boolean} defaultValue the default value to use
	 */
  variation(key, defaultValue=false) {
    if (!this.get('isInitialized')) {
      warn("<service:launch-darkly::variation> was called before it was initialized");
    }
    let val = this._client.variation(key, defaultValue);
    return val;
  },

  /**
   * Proxy the Launch Darkly identify method but instead of a callback function this method
   * returns a promise when launch darkly returns
   *
   * @public
   * @method identify
   * @param user {object} user object
   * @param hash {object} hash for the user
   * @return {Promise} a promsie object for onDone
   */
  identify(user, hash) {
    if (!this.get('isInitialized')) {
      warn("<service:launch-darkly::track> was called before it was initialized");
    }
    return new Promise(resolve => {
      this._client.identify(user, hash, () => {
        run(null, resolve, true);
      });
    });
  },

  /**
   * on event handler
   *
   * @public
   * @method on
   * @param name {string}
   * @param handler {function}
   */
  on(name, handler) {
    this._client.on(name, function(data) {
      this.trigger(name, data);
    }, this);

    this._super(name, handler);
  },


  /**
   * off event handler
   *
   * @public
   * @method off
   * @param name {string}
   * @param handler {function}
   */
  off(name, handler) {
    this._client.off(name);
    this._super(name, handler);
  }
});
