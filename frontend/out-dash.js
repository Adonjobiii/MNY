var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/pages/Dashboard.jsx
var Dashboard_exports = {};
__export(Dashboard_exports, {
  default: () => Dashboard
});
module.exports = __toCommonJS(Dashboard_exports);
var import_react3 = __toESM(require("react"), 1);

// node_modules/engine.io-parser/build/esm/commons.js
var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
  PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
var ERROR_PACKET = { type: "error", data: "parser error" };

// node_modules/engine.io-parser/build/esm/encodePacket.browser.js
var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
var withNativeArrayBuffer = typeof ArrayBuffer === "function";
var isView = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
};
var encodePacket = ({ type, data }, supportsBinary, callback) => {
  if (withNativeBlob && data instanceof Blob) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(data, callback);
    }
  } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(new Blob([data]), callback);
    }
  }
  return callback(PACKET_TYPES[type] + (data || ""));
};
var encodeBlobAsBase64 = (data, callback) => {
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const content = fileReader.result.split(",")[1];
    callback("b" + (content || ""));
  };
  return fileReader.readAsDataURL(data);
};
function toArray(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  } else {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
}
var TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
  if (withNativeBlob && packet.data instanceof Blob) {
    return packet.data.arrayBuffer().then(toArray).then(callback);
  } else if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) {
    return callback(toArray(packet.data));
  }
  encodePacket(packet, false, (encoded) => {
    if (!TEXT_ENCODER) {
      TEXT_ENCODER = new TextEncoder();
    }
    callback(TEXT_ENCODER.encode(encoded));
  });
}

// node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}
var decode = (base64) => {
  let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};

// node_modules/engine.io-parser/build/esm/decodePacket.browser.js
var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
var decodePacket = (encodedPacket, binaryType) => {
  if (typeof encodedPacket !== "string") {
    return {
      type: "message",
      data: mapBinary(encodedPacket, binaryType)
    };
  }
  const type = encodedPacket.charAt(0);
  if (type === "b") {
    return {
      type: "message",
      data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
    };
  }
  const packetType = PACKET_TYPES_REVERSE[type];
  if (!packetType) {
    return ERROR_PACKET;
  }
  return encodedPacket.length > 1 ? {
    type: PACKET_TYPES_REVERSE[type],
    data: encodedPacket.substring(1)
  } : {
    type: PACKET_TYPES_REVERSE[type]
  };
};
var decodeBase64Packet = (data, binaryType) => {
  if (withNativeArrayBuffer2) {
    const decoded = decode(data);
    return mapBinary(decoded, binaryType);
  } else {
    return { base64: true, data };
  }
};
var mapBinary = (data, binaryType) => {
  switch (binaryType) {
    case "blob":
      if (data instanceof Blob) {
        return data;
      } else {
        return new Blob([data]);
      }
    case "arraybuffer":
    default:
      if (data instanceof ArrayBuffer) {
        return data;
      } else {
        return data.buffer;
      }
  }
};

// node_modules/engine.io-parser/build/esm/index.js
var SEPARATOR = String.fromCharCode(30);
var encodePayload = (packets, callback) => {
  const length = packets.length;
  const encodedPackets = new Array(length);
  let count = 0;
  packets.forEach((packet, i) => {
    encodePacket(packet, false, (encodedPacket) => {
      encodedPackets[i] = encodedPacket;
      if (++count === length) {
        callback(encodedPackets.join(SEPARATOR));
      }
    });
  });
};
var decodePayload = (encodedPayload, binaryType) => {
  const encodedPackets = encodedPayload.split(SEPARATOR);
  const packets = [];
  for (let i = 0; i < encodedPackets.length; i++) {
    const decodedPacket = decodePacket(encodedPackets[i], binaryType);
    packets.push(decodedPacket);
    if (decodedPacket.type === "error") {
      break;
    }
  }
  return packets;
};
function createPacketEncoderStream() {
  return new TransformStream({
    transform(packet, controller) {
      encodePacketToBinary(packet, (encodedPacket) => {
        const payloadLength = encodedPacket.length;
        let header;
        if (payloadLength < 126) {
          header = new Uint8Array(1);
          new DataView(header.buffer).setUint8(0, payloadLength);
        } else if (payloadLength < 65536) {
          header = new Uint8Array(3);
          const view = new DataView(header.buffer);
          view.setUint8(0, 126);
          view.setUint16(1, payloadLength);
        } else {
          header = new Uint8Array(9);
          const view = new DataView(header.buffer);
          view.setUint8(0, 127);
          view.setBigUint64(1, BigInt(payloadLength));
        }
        if (packet.data && typeof packet.data !== "string") {
          header[0] |= 128;
        }
        controller.enqueue(header);
        controller.enqueue(encodedPacket);
      });
    }
  });
}
var TEXT_DECODER;
function totalLength(chunks) {
  return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
  if (chunks[0].length === size) {
    return chunks.shift();
  }
  const buffer = new Uint8Array(size);
  let j = 0;
  for (let i = 0; i < size; i++) {
    buffer[i] = chunks[0][j++];
    if (j === chunks[0].length) {
      chunks.shift();
      j = 0;
    }
  }
  if (chunks.length && j < chunks[0].length) {
    chunks[0] = chunks[0].slice(j);
  }
  return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
  if (!TEXT_DECODER) {
    TEXT_DECODER = new TextDecoder();
  }
  const chunks = [];
  let state = 0;
  let expectedLength = -1;
  let isBinary2 = false;
  return new TransformStream({
    transform(chunk, controller) {
      chunks.push(chunk);
      while (true) {
        if (state === 0) {
          if (totalLength(chunks) < 1) {
            break;
          }
          const header = concatChunks(chunks, 1);
          isBinary2 = (header[0] & 128) === 128;
          expectedLength = header[0] & 127;
          if (expectedLength < 126) {
            state = 3;
          } else if (expectedLength === 126) {
            state = 1;
          } else {
            state = 2;
          }
        } else if (state === 1) {
          if (totalLength(chunks) < 2) {
            break;
          }
          const headerArray = concatChunks(chunks, 2);
          expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
          state = 3;
        } else if (state === 2) {
          if (totalLength(chunks) < 8) {
            break;
          }
          const headerArray = concatChunks(chunks, 8);
          const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
          const n = view.getUint32(0);
          if (n > Math.pow(2, 53 - 32) - 1) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
          expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
          state = 3;
        } else {
          if (totalLength(chunks) < expectedLength) {
            break;
          }
          const data = concatChunks(chunks, expectedLength);
          controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
          state = 0;
        }
        if (expectedLength === 0 || expectedLength > maxPayload) {
          controller.enqueue(ERROR_PACKET);
          break;
        }
      }
    }
  });
}
var protocol = 4;

// node_modules/@socket.io/component-emitter/lib/esm/index.js
function Emitter(obj) {
  if (obj) return mixin(obj);
}
function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
  return this;
};
Emitter.prototype.once = function(event, fn) {
  function on2() {
    this.off(event, on2);
    fn.apply(this, arguments);
  }
  on2.fn = fn;
  this.on(event, on2);
  return this;
};
Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  var callbacks = this._callbacks["$" + event];
  if (!callbacks) return this;
  if (1 == arguments.length) {
    delete this._callbacks["$" + event];
    return this;
  }
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  if (callbacks.length === 0) {
    delete this._callbacks["$" + event];
  }
  return this;
};
Emitter.prototype.emit = function(event) {
  this._callbacks = this._callbacks || {};
  var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }
  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }
  return this;
};
Emitter.prototype.emitReserved = Emitter.prototype.emit;
Emitter.prototype.listeners = function(event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks["$" + event] || [];
};
Emitter.prototype.hasListeners = function(event) {
  return !!this.listeners(event).length;
};

// node_modules/engine.io-client/build/esm/globals.js
var nextTick = (() => {
  const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
  if (isPromiseAvailable) {
    return (cb) => Promise.resolve().then(cb);
  } else {
    return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
  }
})();
var globalThisShim = (() => {
  if (typeof self !== "undefined") {
    return self;
  } else if (typeof window !== "undefined") {
    return window;
  } else {
    return Function("return this")();
  }
})();
var defaultBinaryType = "arraybuffer";
function createCookieJar() {
}

// node_modules/engine.io-client/build/esm/util.js
function pick(obj, ...attr) {
  return attr.reduce((acc, k) => {
    if (obj.hasOwnProperty(k)) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}
var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
  if (opts.useNativeTimers) {
    obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
    obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
  } else {
    obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
    obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
  }
}
var BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
  if (typeof obj === "string") {
    return utf8Length(obj);
  }
  return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
  let c = 0, length = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length;
}
function randomString() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}

// node_modules/engine.io-client/build/esm/contrib/parseqs.js
function encode(obj) {
  let str = "";
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length)
        str += "&";
      str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
    }
  }
  return str;
}
function decode2(qs) {
  let qry = {};
  let pairs = qs.split("&");
  for (let i = 0, l = pairs.length; i < l; i++) {
    let pair = pairs[i].split("=");
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
}

// node_modules/engine.io-client/build/esm/transport.js
var TransportError = class extends Error {
  constructor(reason, description, context) {
    super(reason);
    this.description = description;
    this.context = context;
    this.type = "TransportError";
  }
};
var Transport = class extends Emitter {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(opts) {
    super();
    this.writable = false;
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.query = opts.query;
    this.socket = opts.socket;
    this.supportsBinary = !opts.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(reason, description, context) {
    super.emitReserved("error", new TransportError(reason, description, context));
    return this;
  }
  /**
   * Opens the transport.
   */
  open() {
    this.readyState = "opening";
    this.doOpen();
    return this;
  }
  /**
   * Closes the transport.
   */
  close() {
    if (this.readyState === "opening" || this.readyState === "open") {
      this.doClose();
      this.onClose();
    }
    return this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(packets) {
    if (this.readyState === "open") {
      this.write(packets);
    } else {
    }
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open";
    this.writable = true;
    super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(data) {
    const packet = decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(packet) {
    super.emitReserved("packet", packet);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(details) {
    this.readyState = "closed";
    super.emitReserved("close", details);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(onPause) {
  }
  createUri(schema, query = {}) {
    return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
  }
  _hostname() {
    const hostname = this.opts.hostname;
    return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
  }
  _port() {
    if (this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80)) {
      return ":" + this.opts.port;
    } else {
      return "";
    }
  }
  _query(query) {
    const encodedQuery = encode(query);
    return encodedQuery.length ? "?" + encodedQuery : "";
  }
};

// node_modules/engine.io-client/build/esm/transports/polling.js
var Polling = class extends Transport {
  constructor() {
    super(...arguments);
    this._polling = false;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(onPause) {
    this.readyState = "pausing";
    const pause = () => {
      this.readyState = "paused";
      onPause();
    };
    if (this._polling || !this.writable) {
      let total = 0;
      if (this._polling) {
        total++;
        this.once("pollComplete", function() {
          --total || pause();
        });
      }
      if (!this.writable) {
        total++;
        this.once("drain", function() {
          --total || pause();
        });
      }
    } else {
      pause();
    }
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = true;
    this.doPoll();
    this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(data) {
    const callback = (packet) => {
      if ("opening" === this.readyState && packet.type === "open") {
        this.onOpen();
      }
      if ("close" === packet.type) {
        this.onClose({ description: "transport closed by the server" });
        return false;
      }
      this.onPacket(packet);
    };
    decodePayload(data, this.socket.binaryType).forEach(callback);
    if ("closed" !== this.readyState) {
      this._polling = false;
      this.emitReserved("pollComplete");
      if ("open" === this.readyState) {
        this._poll();
      } else {
      }
    }
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const close = () => {
      this.write([{ type: "close" }]);
    };
    if ("open" === this.readyState) {
      close();
    } else {
      this.once("open", close);
    }
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(packets) {
    this.writable = false;
    encodePayload(packets, (data) => {
      this.doWrite(data, () => {
        this.writable = true;
        this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "https" : "http";
    const query = this.query || {};
    if (false !== this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};

// node_modules/engine.io-client/build/esm/contrib/has-cors.js
var value = false;
try {
  value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
}
var hasCORS = value;

// node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function empty() {
}
var BaseXHR = class extends Polling {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(opts) {
    super(opts);
    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;
      if (!port) {
        port = isSSL ? "443" : "80";
      }
      this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data - data to send.
   * @param {Function} fn - called upon flush.
   * @private
   */
  doWrite(data, fn) {
    const req = this.request({
      method: "POST",
      data
    });
    req.on("success", fn);
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr post error", xhrStatus, context);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const req = this.request();
    req.on("data", this.onData.bind(this));
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr poll error", xhrStatus, context);
    });
    this.pollXhr = req;
  }
};
var Request = class _Request extends Emitter {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(createRequest, uri, opts) {
    super();
    this.createRequest = createRequest;
    installTimerFunctions(this, opts);
    this._opts = opts;
    this._method = opts.method || "GET";
    this._uri = uri;
    this._data = void 0 !== opts.data ? opts.data : null;
    this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var _a;
    const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    opts.xdomain = !!this._opts.xd;
    const xhr = this._xhr = this.createRequest(opts);
    try {
      xhr.open(this._method, this._uri, true);
      try {
        if (this._opts.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (let i in this._opts.extraHeaders) {
            if (this._opts.extraHeaders.hasOwnProperty(i)) {
              xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
            }
          }
        }
      } catch (e) {
      }
      if ("POST" === this._method) {
        try {
          xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (e) {
        }
      }
      try {
        xhr.setRequestHeader("Accept", "*/*");
      } catch (e) {
      }
      (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this._opts.withCredentials;
      }
      if (this._opts.requestTimeout) {
        xhr.timeout = this._opts.requestTimeout;
      }
      xhr.onreadystatechange = () => {
        var _a2;
        if (xhr.readyState === 3) {
          (_a2 = this._opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(
            // @ts-ignore
            xhr.getResponseHeader("set-cookie")
          );
        }
        if (4 !== xhr.readyState)
          return;
        if (200 === xhr.status || 1223 === xhr.status) {
          this._onLoad();
        } else {
          this.setTimeoutFn(() => {
            this._onError(typeof xhr.status === "number" ? xhr.status : 0);
          }, 0);
        }
      };
      xhr.send(this._data);
    } catch (e) {
      this.setTimeoutFn(() => {
        this._onError(e);
      }, 0);
      return;
    }
    if (typeof document !== "undefined") {
      this._index = _Request.requestsCount++;
      _Request.requests[this._index] = this;
    }
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(err) {
    this.emitReserved("error", err, this._xhr);
    this._cleanup(true);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(fromError) {
    if ("undefined" === typeof this._xhr || null === this._xhr) {
      return;
    }
    this._xhr.onreadystatechange = empty;
    if (fromError) {
      try {
        this._xhr.abort();
      } catch (e) {
      }
    }
    if (typeof document !== "undefined") {
      delete _Request.requests[this._index];
    }
    this._xhr = null;
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const data = this._xhr.responseText;
    if (data !== null) {
      this.emitReserved("data", data);
      this.emitReserved("success");
      this._cleanup();
    }
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
Request.requestsCount = 0;
Request.requests = {};
if (typeof document !== "undefined") {
  if (typeof attachEvent === "function") {
    attachEvent("onunload", unloadHandler);
  } else if (typeof addEventListener === "function") {
    const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
    addEventListener(terminationEvent, unloadHandler, false);
  }
}
function unloadHandler() {
  for (let i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}
var hasXHR2 = (function() {
  const xhr = newRequest({
    xdomain: false
  });
  return xhr && xhr.responseType !== null;
})();
var XHR = class extends BaseXHR {
  constructor(opts) {
    super(opts);
    const forceBase64 = opts && opts.forceBase64;
    this.supportsBinary = hasXHR2 && !forceBase64;
  }
  request(opts = {}) {
    Object.assign(opts, { xd: this.xd }, this.opts);
    return new Request(newRequest, this.uri(), opts);
  }
};
function newRequest(opts) {
  const xdomain = opts.xdomain;
  try {
    if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) {
  }
  if (!xdomain) {
    try {
      return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e) {
    }
  }
}

// node_modules/engine.io-client/build/esm/transports/websocket.js
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
var BaseWS = class extends Transport {
  get name() {
    return "websocket";
  }
  doOpen() {
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    if (this.opts.extraHeaders) {
      opts.headers = this.opts.extraHeaders;
    }
    try {
      this.ws = this.createSocket(uri, protocols, opts);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this.ws.binaryType = this.socket.binaryType;
    this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      if (this.opts.autoUnref) {
        this.ws._socket.unref();
      }
      this.onOpen();
    };
    this.ws.onclose = (closeEvent) => this.onClose({
      description: "websocket connection closed",
      context: closeEvent
    });
    this.ws.onmessage = (ev) => this.onData(ev.data);
    this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      encodePacket(packet, this.supportsBinary, (data) => {
        try {
          this.doWrite(packet, data);
        } catch (e) {
        }
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    if (typeof this.ws !== "undefined") {
      this.ws.onerror = () => {
      };
      this.ws.close();
      this.ws = null;
    }
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "wss" : "ws";
    const query = this.query || {};
    if (this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};
var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
var WS = class extends BaseWS {
  createSocket(uri, protocols, opts) {
    return !isReactNative ? protocols ? new WebSocketCtor(uri, protocols) : new WebSocketCtor(uri) : new WebSocketCtor(uri, protocols, opts);
  }
  doWrite(_packet, data) {
    this.ws.send(data);
  }
};

// node_modules/engine.io-client/build/esm/transports/webtransport.js
var WT = class extends Transport {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((err) => {
      this.onError("webtransport error", err);
    });
    this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((stream) => {
        const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
        const reader = stream.readable.pipeThrough(decoderStream).getReader();
        const encoderStream = createPacketEncoderStream();
        encoderStream.readable.pipeTo(stream.writable);
        this._writer = encoderStream.writable.getWriter();
        const read = () => {
          reader.read().then(({ done, value: value2 }) => {
            if (done) {
              return;
            }
            this.onPacket(value2);
            read();
          }).catch((err) => {
          });
        };
        read();
        const packet = { type: "open" };
        if (this.query.sid) {
          packet.data = `{"sid":"${this.query.sid}"}`;
        }
        this._writer.write(packet).then(() => this.onOpen());
      });
    });
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      this._writer.write(packet).then(() => {
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    var _a;
    (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
  }
};

// node_modules/engine.io-client/build/esm/transports/index.js
var transports = {
  websocket: WS,
  webtransport: WT,
  polling: XHR
};

// node_modules/engine.io-client/build/esm/contrib/parseuri.js
var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function parse(str) {
  if (str.length > 8e3) {
    throw "URI too long";
  }
  const src = str, b = str.indexOf("["), e = str.indexOf("]");
  if (b != -1 && e != -1) {
    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
  }
  let m = re.exec(str || ""), uri = {}, i = 14;
  while (i--) {
    uri[parts[i]] = m[i] || "";
  }
  if (b != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
    uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
    uri.ipv6uri = true;
  }
  uri.pathNames = pathNames(uri, uri["path"]);
  uri.queryKey = queryKey(uri, uri["query"]);
  return uri;
}
function pathNames(obj, path) {
  const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
  if (path.slice(0, 1) == "/" || path.length === 0) {
    names.splice(0, 1);
  }
  if (path.slice(-1) == "/") {
    names.splice(names.length - 1, 1);
  }
  return names;
}
function queryKey(uri, query) {
  const data = {};
  query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
    if ($1) {
      data[$1] = $2;
    }
  });
  return data;
}

// node_modules/engine.io-client/build/esm/socket.js
var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
var OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) {
  addEventListener("offline", () => {
    OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
  }, false);
}
var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends Emitter {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(uri, opts) {
    super();
    this.binaryType = defaultBinaryType;
    this.writeBuffer = [];
    this._prevBufferLen = 0;
    this._pingInterval = -1;
    this._pingTimeout = -1;
    this._maxPayload = -1;
    this._pingTimeoutTime = Infinity;
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = null;
    }
    if (uri) {
      const parsedUri = parse(uri);
      opts.hostname = parsedUri.host;
      opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
      opts.port = parsedUri.port;
      if (parsedUri.query)
        opts.query = parsedUri.query;
    } else if (opts.host) {
      opts.hostname = parse(opts.host).host;
    }
    installTimerFunctions(this, opts);
    this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
    if (opts.hostname && !opts.port) {
      opts.port = this.secure ? "443" : "80";
    }
    this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
    this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
    this.transports = [];
    this._transportsByName = {};
    opts.transports.forEach((t) => {
      const transportName = t.prototype.name;
      this.transports.push(transportName);
      this._transportsByName[transportName] = t;
    });
    this.opts = Object.assign({
      path: "/engine.io",
      agent: false,
      withCredentials: false,
      upgrade: true,
      timestampParam: "t",
      rememberUpgrade: false,
      addTrailingSlash: true,
      rejectUnauthorized: true,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: false
    }, opts);
    this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
    if (typeof this.opts.query === "string") {
      this.opts.query = decode2(this.opts.query);
    }
    if (withEventListeners) {
      if (this.opts.closeOnBeforeunload) {
        this._beforeunloadEventListener = () => {
          if (this.transport) {
            this.transport.removeAllListeners();
            this.transport.close();
          }
        };
        addEventListener("beforeunload", this._beforeunloadEventListener, false);
      }
      if (this.hostname !== "localhost") {
        this._offlineEventListener = () => {
          this._onClose("transport close", {
            description: "network connection lost"
          });
        };
        OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
      }
    }
    if (this.opts.withCredentials) {
      this._cookieJar = createCookieJar();
    }
    this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(name) {
    const query = Object.assign({}, this.opts.query);
    query.EIO = protocol;
    query.transport = name;
    if (this.id)
      query.sid = this.id;
    const opts = Object.assign({}, this.opts, {
      query,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[name]);
    return new this._transportsByName[name](opts);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const transport = this.createTransport(transportName);
    transport.open();
    this.setTransport(transport);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(transport) {
    if (this.transport) {
      this.transport.removeAllListeners();
    }
    this.transport = transport;
    transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open";
    _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
    this.emitReserved("open");
    this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(packet) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.emitReserved("packet", packet);
      this.emitReserved("heartbeat");
      switch (packet.type) {
        case "open":
          this.onHandshake(JSON.parse(packet.data));
          break;
        case "ping":
          this._sendPacket("pong");
          this.emitReserved("ping");
          this.emitReserved("pong");
          this._resetPingTimeout();
          break;
        case "error":
          const err = new Error("server error");
          err.code = packet.data;
          this._onError(err);
          break;
        case "message":
          this.emitReserved("data", packet.data);
          this.emitReserved("message", packet.data);
          break;
      }
    } else {
    }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(data) {
    this.emitReserved("handshake", data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this._pingInterval = data.pingInterval;
    this._pingTimeout = data.pingTimeout;
    this._maxPayload = data.maxPayload;
    this.onOpen();
    if ("closed" === this.readyState)
      return;
    this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const delay = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + delay;
    this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, delay);
    if (this.opts.autoUnref) {
      this._pingTimeoutTimer.unref();
    }
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen);
    this._prevBufferLen = 0;
    if (0 === this.writeBuffer.length) {
      this.emitReserved("drain");
    } else {
      this.flush();
    }
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const packets = this._getWritablePackets();
      this.transport.send(packets);
      this._prevBufferLen = packets.length;
      this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
    if (!shouldCheckPayloadSize) {
      return this.writeBuffer;
    }
    let payloadSize = 1;
    for (let i = 0; i < this.writeBuffer.length; i++) {
      const data = this.writeBuffer[i].data;
      if (data) {
        payloadSize += byteLength(data);
      }
      if (i > 0 && payloadSize > this._maxPayload) {
        return this.writeBuffer.slice(0, i);
      }
      payloadSize += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return true;
    const hasExpired = Date.now() > this._pingTimeoutTime;
    if (hasExpired) {
      this._pingTimeoutTime = 0;
      nextTick(() => {
        this._onClose("ping timeout");
      }, this.setTimeoutFn);
    }
    return hasExpired;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type - packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(type, data, options, fn) {
    if ("function" === typeof data) {
      fn = data;
      data = void 0;
    }
    if ("function" === typeof options) {
      fn = options;
      options = null;
    }
    if ("closing" === this.readyState || "closed" === this.readyState) {
      return;
    }
    options = options || {};
    options.compress = false !== options.compress;
    const packet = {
      type,
      data,
      options
    };
    this.emitReserved("packetCreate", packet);
    this.writeBuffer.push(packet);
    if (fn)
      this.once("flush", fn);
    this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const close = () => {
      this._onClose("forced close");
      this.transport.close();
    };
    const cleanupAndClose = () => {
      this.off("upgrade", cleanupAndClose);
      this.off("upgradeError", cleanupAndClose);
      close();
    };
    const waitForUpgrade = () => {
      this.once("upgrade", cleanupAndClose);
      this.once("upgradeError", cleanupAndClose);
    };
    if ("opening" === this.readyState || "open" === this.readyState) {
      this.readyState = "closing";
      if (this.writeBuffer.length) {
        this.once("drain", () => {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }
    return this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(err) {
    _SocketWithoutUpgrade.priorWebsocketSuccess = false;
    if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
      this.transports.shift();
      return this._open();
    }
    this.emitReserved("error", err);
    this._onClose("transport error", err);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(reason, description) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.clearTimeoutFn(this._pingTimeoutTimer);
      this.transport.removeAllListeners("close");
      this.transport.close();
      this.transport.removeAllListeners();
      if (withEventListeners) {
        if (this._beforeunloadEventListener) {
          removeEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this._offlineEventListener) {
          const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
          if (i !== -1) {
            OFFLINE_EVENT_LISTENERS.splice(i, 1);
          }
        }
      }
      this.readyState = "closed";
      this.id = null;
      this.emitReserved("close", reason, description);
      this.writeBuffer = [];
      this._prevBufferLen = 0;
    }
  }
};
SocketWithoutUpgrade.protocol = protocol;
var SocketWithUpgrade = class extends SocketWithoutUpgrade {
  constructor() {
    super(...arguments);
    this._upgrades = [];
  }
  onOpen() {
    super.onOpen();
    if ("open" === this.readyState && this.opts.upgrade) {
      for (let i = 0; i < this._upgrades.length; i++) {
        this._probe(this._upgrades[i]);
      }
    }
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(name) {
    let transport = this.createTransport(name);
    let failed = false;
    SocketWithoutUpgrade.priorWebsocketSuccess = false;
    const onTransportOpen = () => {
      if (failed)
        return;
      transport.send([{ type: "ping", data: "probe" }]);
      transport.once("packet", (msg) => {
        if (failed)
          return;
        if ("pong" === msg.type && "probe" === msg.data) {
          this.upgrading = true;
          this.emitReserved("upgrading", transport);
          if (!transport)
            return;
          SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
          this.transport.pause(() => {
            if (failed)
              return;
            if ("closed" === this.readyState)
              return;
            cleanup();
            this.setTransport(transport);
            transport.send([{ type: "upgrade" }]);
            this.emitReserved("upgrade", transport);
            transport = null;
            this.upgrading = false;
            this.flush();
          });
        } else {
          const err = new Error("probe error");
          err.transport = transport.name;
          this.emitReserved("upgradeError", err);
        }
      });
    };
    function freezeTransport() {
      if (failed)
        return;
      failed = true;
      cleanup();
      transport.close();
      transport = null;
    }
    const onerror = (err) => {
      const error = new Error("probe error: " + err);
      error.transport = transport.name;
      freezeTransport();
      this.emitReserved("upgradeError", error);
    };
    function onTransportClose() {
      onerror("transport closed");
    }
    function onclose() {
      onerror("socket closed");
    }
    function onupgrade(to) {
      if (transport && to.name !== transport.name) {
        freezeTransport();
      }
    }
    const cleanup = () => {
      transport.removeListener("open", onTransportOpen);
      transport.removeListener("error", onerror);
      transport.removeListener("close", onTransportClose);
      this.off("close", onclose);
      this.off("upgrading", onupgrade);
    };
    transport.once("open", onTransportOpen);
    transport.once("error", onerror);
    transport.once("close", onTransportClose);
    this.once("close", onclose);
    this.once("upgrading", onupgrade);
    if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
      this.setTimeoutFn(() => {
        if (!failed) {
          transport.open();
        }
      }, 200);
    } else {
      transport.open();
    }
  }
  onHandshake(data) {
    this._upgrades = this._filterUpgrades(data.upgrades);
    super.onHandshake(data);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(upgrades) {
    const filteredUpgrades = [];
    for (let i = 0; i < upgrades.length; i++) {
      if (~this.transports.indexOf(upgrades[i]))
        filteredUpgrades.push(upgrades[i]);
    }
    return filteredUpgrades;
  }
};
var Socket = class extends SocketWithUpgrade {
  constructor(uri, opts = {}) {
    const o = typeof uri === "object" ? uri : opts;
    if (!o.transports || o.transports && typeof o.transports[0] === "string") {
      o.transports = (o.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t) => !!t);
    }
    super(uri, o);
  }
};

// node_modules/engine.io-client/build/esm/index.js
var protocol2 = Socket.protocol;

// node_modules/socket.io-client/build/esm/url.js
function url(uri, path = "", loc) {
  let obj = uri;
  loc = loc || typeof location !== "undefined" && location;
  if (null == uri)
    uri = loc.protocol + "//" + loc.host;
  if (typeof uri === "string") {
    if ("/" === uri.charAt(0)) {
      if ("/" === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }
    if (!/^(https?|wss?):\/\//.test(uri)) {
      if ("undefined" !== typeof loc) {
        uri = loc.protocol + "//" + uri;
      } else {
        uri = "https://" + uri;
      }
    }
    obj = parse(uri);
  }
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = "80";
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = "443";
    }
  }
  obj.path = obj.path || "/";
  const ipv6 = obj.host.indexOf(":") !== -1;
  const host = ipv6 ? "[" + obj.host + "]" : obj.host;
  obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
  obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
  return obj;
}

// node_modules/socket.io-parser/build/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  Decoder: () => Decoder,
  Encoder: () => Encoder,
  PacketType: () => PacketType,
  isPacketValid: () => isPacketValid,
  protocol: () => protocol3
});

// node_modules/socket.io-parser/build/esm/is-binary.js
var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
var isView2 = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
var toString = Object.prototype.toString;
var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
function isBinary(obj) {
  return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
}
function hasBinary(obj, toJSON) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }
    return false;
  }
  if (isBinary(obj)) {
    return true;
  }
  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }
  return false;
}

// node_modules/socket.io-parser/build/esm/binary.js
function deconstructPacket(packet) {
  const buffers = [];
  const packetData = packet.data;
  const pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length;
  return { packet: pack, buffers };
}
function _deconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (isBinary(data)) {
    const placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (Array.isArray(data)) {
    const newData = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }
    return newData;
  } else if (typeof data === "object" && !(data instanceof Date)) {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
    }
    return newData;
  }
  return data;
}
function reconstructPacket(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  delete packet.attachments;
  return packet;
}
function _reconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (data && data._placeholder === true) {
    const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
    if (isIndexValid) {
      return buffers[data.num];
    } else {
      throw new Error("illegal attachments");
    }
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }
  }
  return data;
}

// node_modules/socket.io-parser/build/esm/index.js
var RESERVED_EVENTS = [
  "connect",
  // used on the client side
  "connect_error",
  // used on the client side
  "disconnect",
  // used on both sides
  "disconnecting",
  // used on the server side
  "newListener",
  // used by the Node.js EventEmitter
  "removeListener"
  // used by the Node.js EventEmitter
];
var protocol3 = 5;
var PacketType;
(function(PacketType2) {
  PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
  PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
  PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
  PacketType2[PacketType2["ACK"] = 3] = "ACK";
  PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
  PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
  PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
var Encoder = class {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(replacer) {
    this.replacer = replacer;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(obj) {
    if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
      if (hasBinary(obj)) {
        return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
      }
    }
    return [this.encodeAsString(obj)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(obj) {
    let str = "" + obj.type;
    if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
      str += obj.attachments + "-";
    }
    if (obj.nsp && "/" !== obj.nsp) {
      str += obj.nsp + ",";
    }
    if (null != obj.id) {
      str += obj.id;
    }
    if (null != obj.data) {
      str += JSON.stringify(obj.data, this.replacer);
    }
    return str;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(obj) {
    const deconstruction = deconstructPacket(obj);
    const pack = this.encodeAsString(deconstruction.packet);
    const buffers = deconstruction.buffers;
    buffers.unshift(pack);
    return buffers;
  }
};
var Decoder = class _Decoder extends Emitter {
  /**
   * Decoder constructor
   */
  constructor(opts) {
    super();
    this.opts = Object.assign({
      reviver: void 0,
      maxAttachments: 10
    }, typeof opts === "function" ? { reviver: opts } : opts);
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(obj) {
    let packet;
    if (typeof obj === "string") {
      if (this.reconstructor) {
        throw new Error("got plaintext data when reconstructing a packet");
      }
      packet = this.decodeString(obj);
      const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
      if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
        packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
        this.reconstructor = new BinaryReconstructor(packet);
        if (packet.attachments === 0) {
          super.emitReserved("decoded", packet);
        }
      } else {
        super.emitReserved("decoded", packet);
      }
    } else if (isBinary(obj) || obj.base64) {
      if (!this.reconstructor) {
        throw new Error("got binary data when not reconstructing a packet");
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) {
          this.reconstructor = null;
          super.emitReserved("decoded", packet);
        }
      }
    } else {
      throw new Error("Unknown type: " + obj);
    }
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(str) {
    let i = 0;
    const p = {
      type: Number(str.charAt(0))
    };
    if (PacketType[p.type] === void 0) {
      throw new Error("unknown packet type " + p.type);
    }
    if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
      const start = i + 1;
      while (str.charAt(++i) !== "-" && i != str.length) {
      }
      const buf = str.substring(start, i);
      if (buf != Number(buf) || str.charAt(i) !== "-") {
        throw new Error("Illegal attachments");
      }
      const n = Number(buf);
      if (!isInteger(n) || n < 0) {
        throw new Error("Illegal attachments");
      } else if (n > this.opts.maxAttachments) {
        throw new Error("too many attachments");
      }
      p.attachments = n;
    }
    if ("/" === str.charAt(i + 1)) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if ("," === c)
          break;
        if (i === str.length)
          break;
      }
      p.nsp = str.substring(start, i);
    } else {
      p.nsp = "/";
    }
    const next = str.charAt(i + 1);
    if ("" !== next && Number(next) == next) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if (null == c || Number(c) != c) {
          --i;
          break;
        }
        if (i === str.length)
          break;
      }
      p.id = Number(str.substring(start, i + 1));
    }
    if (str.charAt(++i)) {
      const payload = this.tryParse(str.substr(i));
      if (_Decoder.isPayloadValid(p.type, payload)) {
        p.data = payload;
      } else {
        throw new Error("invalid payload");
      }
    }
    return p;
  }
  tryParse(str) {
    try {
      return JSON.parse(str, this.opts.reviver);
    } catch (e) {
      return false;
    }
  }
  static isPayloadValid(type, payload) {
    switch (type) {
      case PacketType.CONNECT:
        return isObject(payload);
      case PacketType.DISCONNECT:
        return payload === void 0;
      case PacketType.CONNECT_ERROR:
        return typeof payload === "string" || isObject(payload);
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        return Array.isArray(payload);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
      this.reconstructor = null;
    }
  }
};
var BinaryReconstructor = class {
  constructor(packet) {
    this.packet = packet;
    this.buffers = [];
    this.reconPack = packet;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) {
      const packet = reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null;
    this.buffers = [];
  }
};
function isNamespaceValid(nsp) {
  return typeof nsp === "string";
}
var isInteger = Number.isInteger || function(value2) {
  return typeof value2 === "number" && isFinite(value2) && Math.floor(value2) === value2;
};
function isAckIdValid(id) {
  return id === void 0 || isInteger(id);
}
function isObject(value2) {
  return Object.prototype.toString.call(value2) === "[object Object]";
}
function isDataValid(type, payload) {
  switch (type) {
    case PacketType.CONNECT:
      return payload === void 0 || isObject(payload);
    case PacketType.DISCONNECT:
      return payload === void 0;
    case PacketType.EVENT:
      return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
    case PacketType.ACK:
      return Array.isArray(payload);
    case PacketType.CONNECT_ERROR:
      return typeof payload === "string" || isObject(payload);
    default:
      return false;
  }
}
function isPacketValid(packet) {
  return isNamespaceValid(packet.nsp) && isAckIdValid(packet.id) && isDataValid(packet.type, packet.data);
}

// node_modules/socket.io-client/build/esm/on.js
function on(obj, ev, fn) {
  obj.on(ev, fn);
  return function subDestroy() {
    obj.off(ev, fn);
  };
}

// node_modules/socket.io-client/build/esm/socket.js
var RESERVED_EVENTS2 = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
var Socket2 = class extends Emitter {
  /**
   * `Socket` constructor.
   */
  constructor(io, nsp, opts) {
    super();
    this.connected = false;
    this.recovered = false;
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this._queue = [];
    this._queueSeq = 0;
    this.ids = 0;
    this.acks = {};
    this.flags = {};
    this.io = io;
    this.nsp = nsp;
    if (opts && opts.auth) {
      this.auth = opts.auth;
    }
    this._opts = Object.assign({}, opts);
    if (this.io._autoConnect)
      this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const io = this.io;
    this.subs = [
      on(io, "open", this.onopen.bind(this)),
      on(io, "packet", this.onpacket.bind(this)),
      on(io, "error", this.onerror.bind(this)),
      on(io, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    if (this.connected)
      return this;
    this.subEvents();
    if (!this.io["_reconnecting"])
      this.io.open();
    if ("open" === this.io._readyState)
      this.onopen();
    return this;
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...args) {
    args.unshift("message");
    this.emit.apply(this, args);
    return this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(ev, ...args) {
    var _a, _b, _c;
    if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
      throw new Error('"' + ev.toString() + '" is a reserved event name');
    }
    args.unshift(ev);
    if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
      this._addToQueue(args);
      return this;
    }
    const packet = {
      type: PacketType.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = this.flags.compress !== false;
    if ("function" === typeof args[args.length - 1]) {
      const id = this.ids++;
      const ack = args.pop();
      this._registerAckCallback(id, ack);
      packet.id = id;
    }
    const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
    const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
    const discardPacket = this.flags.volatile && !isTransportWritable;
    if (discardPacket) {
    } else if (isConnected) {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }
    this.flags = {};
    return this;
  }
  /**
   * @private
   */
  _registerAckCallback(id, ack) {
    var _a;
    const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
    if (timeout === void 0) {
      this.acks[id] = ack;
      return;
    }
    const timer = this.io.setTimeoutFn(() => {
      delete this.acks[id];
      for (let i = 0; i < this.sendBuffer.length; i++) {
        if (this.sendBuffer[i].id === id) {
          this.sendBuffer.splice(i, 1);
        }
      }
      ack.call(this, new Error("operation has timed out"));
    }, timeout);
    const fn = (...args) => {
      this.io.clearTimeoutFn(timer);
      ack.apply(this, args);
    };
    fn.withError = true;
    this.acks[id] = fn;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(ev, ...args) {
    return new Promise((resolve, reject) => {
      const fn = (arg1, arg2) => {
        return arg1 ? reject(arg1) : resolve(arg2);
      };
      fn.withError = true;
      args.push(fn);
      this.emit(ev, ...args);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(args) {
    let ack;
    if (typeof args[args.length - 1] === "function") {
      ack = args.pop();
    }
    const packet = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: false,
      args,
      flags: Object.assign({ fromQueue: true }, this.flags)
    };
    args.push((err, ...responseArgs) => {
      if (packet !== this._queue[0]) {
      }
      const hasError = err !== null;
      if (hasError) {
        if (packet.tryCount > this._opts.retries) {
          this._queue.shift();
          if (ack) {
            ack(err);
          }
        }
      } else {
        this._queue.shift();
        if (ack) {
          ack(null, ...responseArgs);
        }
      }
      packet.pending = false;
      return this._drainQueue();
    });
    this._queue.push(packet);
    this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(force = false) {
    if (!this.connected || this._queue.length === 0) {
      return;
    }
    const packet = this._queue[0];
    if (packet.pending && !force) {
      return;
    }
    packet.pending = true;
    packet.tryCount++;
    this.flags = packet.flags;
    this.emit.apply(this, packet.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(packet) {
    packet.nsp = this.nsp;
    this.io._packet(packet);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    if (typeof this.auth == "function") {
      this.auth((data) => {
        this._sendConnectPacket(data);
      });
    } else {
      this._sendConnectPacket(this.auth);
    }
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(data) {
    this.packet({
      type: PacketType.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(err) {
    if (!this.connected) {
      this.emitReserved("connect_error", err);
    }
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(reason, description) {
    this.connected = false;
    delete this.id;
    this.emitReserved("disconnect", reason, description);
    this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((id) => {
      const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
      if (!isBuffered) {
        const ack = this.acks[id];
        delete this.acks[id];
        if (ack.withError) {
          ack.call(this, new Error("socket has been disconnected"));
        }
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(packet) {
    const sameNamespace = packet.nsp === this.nsp;
    if (!sameNamespace)
      return;
    switch (packet.type) {
      case PacketType.CONNECT:
        if (packet.data && packet.data.sid) {
          this.onconnect(packet.data.sid, packet.data.pid);
        } else {
          this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        }
        break;
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        this.onevent(packet);
        break;
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        this.onack(packet);
        break;
      case PacketType.DISCONNECT:
        this.ondisconnect();
        break;
      case PacketType.CONNECT_ERROR:
        this.destroy();
        const err = new Error(packet.data.message);
        err.data = packet.data.data;
        this.emitReserved("connect_error", err);
        break;
    }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(packet) {
    const args = packet.data || [];
    if (null != packet.id) {
      args.push(this.ack(packet.id));
    }
    if (this.connected) {
      this.emitEvent(args);
    } else {
      this.receiveBuffer.push(Object.freeze(args));
    }
  }
  emitEvent(args) {
    if (this._anyListeners && this._anyListeners.length) {
      const listeners = this._anyListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    super.emit.apply(this, args);
    if (this._pid && args.length && typeof args[args.length - 1] === "string") {
      this._lastOffset = args[args.length - 1];
    }
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(id) {
    const self2 = this;
    let sent = false;
    return function(...args) {
      if (sent)
        return;
      sent = true;
      self2.packet({
        type: PacketType.ACK,
        id,
        data: args
      });
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(packet) {
    const ack = this.acks[packet.id];
    if (typeof ack !== "function") {
      return;
    }
    delete this.acks[packet.id];
    if (ack.withError) {
      packet.data.unshift(null);
    }
    ack.apply(this, packet.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(id, pid) {
    this.id = id;
    this.recovered = pid && this._pid === pid;
    this._pid = pid;
    this.connected = true;
    this.emitBuffered();
    this._drainQueue(true);
    this.emitReserved("connect");
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((args) => this.emitEvent(args));
    this.receiveBuffer = [];
    this.sendBuffer.forEach((packet) => {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    });
    this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy();
    this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    if (this.subs) {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs = void 0;
    }
    this.io["_destroy"](this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    if (this.connected) {
      this.packet({ type: PacketType.DISCONNECT });
    }
    this.destroy();
    if (this.connected) {
      this.onclose("io client disconnect");
    }
    return this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(compress) {
    this.flags.compress = compress;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    this.flags.volatile = true;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(timeout) {
    this.flags.timeout = timeout;
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(listener) {
    if (!this._anyListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(listener) {
    if (!this._anyOutgoingListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyOutgoingListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyOutgoingListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(packet) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const listeners = this._anyOutgoingListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, packet.data);
      }
    }
  }
};

// node_modules/socket.io-client/build/esm/contrib/backo2.js
function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 1e4;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
Backoff.prototype.duration = function() {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};
Backoff.prototype.reset = function() {
  this.attempts = 0;
};
Backoff.prototype.setMin = function(min) {
  this.ms = min;
};
Backoff.prototype.setMax = function(max) {
  this.max = max;
};
Backoff.prototype.setJitter = function(jitter) {
  this.jitter = jitter;
};

// node_modules/socket.io-client/build/esm/manager.js
var Manager = class extends Emitter {
  constructor(uri, opts) {
    var _a;
    super();
    this.nsps = {};
    this.subs = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    opts.path = opts.path || "/socket.io";
    this.opts = opts;
    installTimerFunctions(this, opts);
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1e3);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
    this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
    this._readyState = "closed";
    this.uri = uri;
    const _parser = opts.parser || esm_exports;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this._autoConnect = opts.autoConnect !== false;
    if (this._autoConnect)
      this.open();
  }
  reconnection(v) {
    if (!arguments.length)
      return this._reconnection;
    this._reconnection = !!v;
    if (!v) {
      this.skipReconnect = true;
    }
    return this;
  }
  reconnectionAttempts(v) {
    if (v === void 0)
      return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  }
  reconnectionDelay(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelay;
    this._reconnectionDelay = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
    return this;
  }
  randomizationFactor(v) {
    var _a;
    if (v === void 0)
      return this._randomizationFactor;
    this._randomizationFactor = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
    return this;
  }
  reconnectionDelayMax(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
    return this;
  }
  timeout(v) {
    if (!arguments.length)
      return this._timeout;
    this._timeout = v;
    return this;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
      this.reconnect();
    }
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(fn) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Socket(this.uri, this.opts);
    const socket2 = this.engine;
    const self2 = this;
    this._readyState = "opening";
    this.skipReconnect = false;
    const openSubDestroy = on(socket2, "open", function() {
      self2.onopen();
      fn && fn();
    });
    const onError = (err) => {
      this.cleanup();
      this._readyState = "closed";
      this.emitReserved("error", err);
      if (fn) {
        fn(err);
      } else {
        this.maybeReconnectOnOpen();
      }
    };
    const errorSub = on(socket2, "error", onError);
    if (false !== this._timeout) {
      const timeout = this._timeout;
      const timer = this.setTimeoutFn(() => {
        openSubDestroy();
        onError(new Error("timeout"));
        socket2.close();
      }, timeout);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
    this.subs.push(openSubDestroy);
    this.subs.push(errorSub);
    return this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(fn) {
    return this.open(fn);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup();
    this._readyState = "open";
    this.emitReserved("open");
    const socket2 = this.engine;
    this.subs.push(
      on(socket2, "ping", this.onping.bind(this)),
      on(socket2, "data", this.ondata.bind(this)),
      on(socket2, "error", this.onerror.bind(this)),
      on(socket2, "close", this.onclose.bind(this)),
      // @ts-ignore
      on(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(packet) {
    nextTick(() => {
      this.emitReserved("packet", packet);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(err) {
    this.emitReserved("error", err);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(nsp, opts) {
    let socket2 = this.nsps[nsp];
    if (!socket2) {
      socket2 = new Socket2(this, nsp, opts);
      this.nsps[nsp] = socket2;
    } else if (this._autoConnect && !socket2.active) {
      socket2.connect();
    }
    return socket2;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(socket2) {
    const nsps = Object.keys(this.nsps);
    for (const nsp of nsps) {
      const socket3 = this.nsps[nsp];
      if (socket3.active) {
        return;
      }
    }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(packet) {
    const encodedPackets = this.encoder.encode(packet);
    for (let i = 0; i < encodedPackets.length; i++) {
      this.engine.write(encodedPackets[i], packet.options);
    }
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((subDestroy) => subDestroy());
    this.subs.length = 0;
    this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = true;
    this._reconnecting = false;
    this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(reason, description) {
    var _a;
    this.cleanup();
    (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
    this.backoff.reset();
    this._readyState = "closed";
    this.emitReserved("close", reason, description);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const self2 = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) {
      this.backoff.reset();
      this.emitReserved("reconnect_failed");
      this._reconnecting = false;
    } else {
      const delay = this.backoff.duration();
      this._reconnecting = true;
      const timer = this.setTimeoutFn(() => {
        if (self2.skipReconnect)
          return;
        this.emitReserved("reconnect_attempt", self2.backoff.attempts);
        if (self2.skipReconnect)
          return;
        self2.open((err) => {
          if (err) {
            self2._reconnecting = false;
            self2.reconnect();
            this.emitReserved("reconnect_error", err);
          } else {
            self2.onreconnect();
          }
        });
      }, delay);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const attempt = this.backoff.attempts;
    this._reconnecting = false;
    this.backoff.reset();
    this.emitReserved("reconnect", attempt);
  }
};

// node_modules/socket.io-client/build/esm/index.js
var cache = {};
function lookup2(uri, opts) {
  if (typeof uri === "object") {
    opts = uri;
    uri = void 0;
  }
  opts = opts || {};
  const parsed = url(uri, opts.path || "/socket.io");
  const source = parsed.source;
  const id = parsed.id;
  const path = parsed.path;
  const sameNamespace = cache[id] && path in cache[id]["nsps"];
  const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
  let io;
  if (newConnection) {
    io = new Manager(source, opts);
  } else {
    if (!cache[id]) {
      cache[id] = new Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.queryKey;
  }
  return io.socket(parsed.path, opts);
}
Object.assign(lookup2, {
  Manager,
  Socket: Socket2,
  io: lookup2,
  connect: lookup2
});

// src/components/FinancialInsights.jsx
var import_react = __toESM(require("react"), 1);
var import_lucide_react = require("lucide-react");
var import_react_router_dom = require("react-router-dom");
function FinancialInsights({ transactions, activeCurrency }) {
  const insights = (0, import_react.useMemo)(() => {
    if (!transactions || transactions.length === 0) return [];
    const currencySymbol = activeCurrency === "INR" ? "\u20B9" : "QAR";
    const isQAR = (tx) => tx.mode?.includes("Qatar") || tx.dueCurrency === "QAR" || tx.mode === "Cash (Qatar Riyal)";
    const currencyTxs = transactions.filter((tx) => activeCurrency === "QAR" ? isQAR(tx) : !isQAR(tx));
    const now = /* @__PURE__ */ new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();
    let currMonthExpenses = 0;
    let prevMonthExpenses = 0;
    let currMonthIncome = 0;
    let prevMonthIncome = 0;
    let currMonthTransfers = 0;
    const currCategoryTotals = {};
    const prevCategoryTotals = {};
    currencyTxs.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const isPrevMonth = txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;
      if (isCurrentMonth) {
        if (tx.type === "Expense") {
          currMonthExpenses += tx.amount;
          currCategoryTotals[tx.category] = (currCategoryTotals[tx.category] || 0) + tx.amount;
        } else if (tx.type === "Income") {
          currMonthIncome += tx.amount;
        } else if (tx.type === "Transfer") {
          currMonthTransfers += tx.amount;
        }
      } else if (isPrevMonth) {
        if (tx.type === "Expense") {
          prevMonthExpenses += tx.amount;
          prevCategoryTotals[tx.category] = (prevCategoryTotals[tx.category] || 0) + tx.amount;
        } else if (tx.type === "Income") {
          prevMonthIncome += tx.amount;
        }
      }
    });
    const generatedInsights = [];
    const hasPrevMonthData = prevMonthExpenses > 0 || prevMonthIncome > 0 || Object.keys(prevCategoryTotals).length > 0;
    const currSavings = currMonthIncome - currMonthExpenses;
    const prevSavings = prevMonthIncome - prevMonthExpenses;
    if (currSavings > 0) {
      if (hasPrevMonthData) {
        const savingDiff = currSavings - prevSavings;
        if (savingDiff > 0) {
          generatedInsights.push({
            id: "savings-up",
            type: "Savings Insights",
            color: "green",
            icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.ShieldCheck, null),
            title: "Savings Increased",
            amountDiff: `+${currencySymbol}${savingDiff.toLocaleString()}`,
            description: `You saved ${currencySymbol}${savingDiff.toLocaleString()} more this month compared to last month.`,
            trend: "up",
            isHighlight: true
          });
        } else if (savingDiff < 0) {
          generatedInsights.push({
            id: "savings-down",
            type: "Savings Insights",
            color: "amber",
            icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.AlertCircle, null),
            title: "Savings Decreased",
            amountDiff: `${currencySymbol}${savingDiff.toLocaleString()}`,
            description: `You saved ${currencySymbol}${Math.abs(savingDiff).toLocaleString()} less this month.`,
            trend: "down"
          });
        } else {
          generatedInsights.push({
            id: "savings-steady",
            type: "Savings Insights",
            color: "blue",
            icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.ShieldCheck, null),
            title: "Savings Steady",
            amountDiff: `${currencySymbol}${currSavings.toLocaleString()}`,
            description: `You have saved ${currencySymbol}${currSavings.toLocaleString()} this month after expenses.`,
            trend: "up"
          });
        }
      } else {
        generatedInsights.push({
          id: "savings-absolute",
          type: "Savings Insights",
          color: "green",
          icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.ShieldCheck, null),
          title: "Total Savings",
          amountDiff: `${currencySymbol}${currSavings.toLocaleString()}`,
          description: `You have saved a total of ${currencySymbol}${currSavings.toLocaleString()} so far this month.`,
          trend: "up",
          isHighlight: true
        });
      }
    }
    if (currMonthExpenses > 0) {
      if (hasPrevMonthData) {
        const expenseDiff = currMonthExpenses - prevMonthExpenses;
        if (expenseDiff > 0) {
          generatedInsights.push({
            id: "spending-up",
            type: "Spending Insights",
            color: "red",
            icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.TrendingUp, null),
            title: "Expenses Increased",
            amountDiff: `+${currencySymbol}${expenseDiff.toLocaleString()}`,
            description: `Your overall spending is ${currencySymbol}${expenseDiff.toLocaleString()} higher than last month.`,
            trend: "up",
            isHighlight: generatedInsights.length === 0
          });
        } else if (expenseDiff < 0) {
          generatedInsights.push({
            id: "spending-down",
            type: "Spending Insights",
            color: "green",
            icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.TrendingDown, null),
            title: "Expenses Decreased",
            amountDiff: `-${currencySymbol}${Math.abs(expenseDiff).toLocaleString()}`,
            description: `Great job! You spent ${currencySymbol}${Math.abs(expenseDiff).toLocaleString()} less than last month overall.`,
            trend: "down",
            isHighlight: generatedInsights.length === 0
          });
        }
      } else {
        generatedInsights.push({
          id: "spending-absolute",
          type: "Spending Insights",
          color: "blue",
          icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Activity, null),
          title: "Total Expenses",
          amountDiff: `${currencySymbol}${currMonthExpenses.toLocaleString()}`,
          description: `You have spent ${currencySymbol}${currMonthExpenses.toLocaleString()} this month.`,
          trend: "neutral",
          isHighlight: generatedInsights.length === 0
        });
      }
    }
    if (hasPrevMonthData) {
      let maxCatIncrease = { cat: null, diff: 0, amount: 0 };
      Object.keys(currCategoryTotals).forEach((cat) => {
        const curr = currCategoryTotals[cat];
        const prev = prevCategoryTotals[cat] || 0;
        const diff = curr - prev;
        if (diff > maxCatIncrease.diff) {
          maxCatIncrease = { cat, diff, amount: curr };
        }
      });
      if (maxCatIncrease.cat && maxCatIncrease.diff > 0) {
        generatedInsights.push({
          id: "cat-up",
          type: "Spending Insights",
          color: "amber",
          icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.ShoppingCart, null),
          title: `${maxCatIncrease.cat} Spending \u2191`,
          amountDiff: `+${currencySymbol}${maxCatIncrease.diff.toLocaleString()}`,
          description: `You spent ${currencySymbol}${maxCatIncrease.diff.toLocaleString()} more on ${maxCatIncrease.cat} compared to last month.`,
          trend: "up"
        });
      }
    }
    let topCat = { cat: null, amount: 0 };
    Object.keys(currCategoryTotals).forEach((cat) => {
      if (currCategoryTotals[cat] > topCat.amount) {
        topCat = { cat, amount: currCategoryTotals[cat] };
      }
    });
    if (topCat.cat) {
      generatedInsights.push({
        id: "top-cat",
        type: "Spending Insights",
        color: "blue",
        icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Activity, null),
        title: `Top Category: ${topCat.cat}`,
        amountDiff: `${currencySymbol}${topCat.amount.toLocaleString()}`,
        description: `Your highest spending category this month is ${topCat.cat} at ${currencySymbol}${topCat.amount.toLocaleString()}.`,
        trend: "neutral"
      });
    }
    if (currMonthTransfers > 0) {
      generatedInsights.push({
        id: "transfers",
        type: "Currency Insights",
        color: "blue",
        icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.ArrowRight, null),
        title: "Transfers Made",
        amountDiff: `${currencySymbol}${currMonthTransfers.toLocaleString()}`,
        description: `You transferred ${currencySymbol}${currMonthTransfers.toLocaleString()} to other accounts this month.`,
        trend: "neutral"
      });
    }
    if (!hasPrevMonthData && generatedInsights.length > 0) {
      generatedInsights.push({
        id: "baseline",
        type: "Account Insights",
        color: "blue",
        icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Activity, null),
        title: "Establishing Baseline",
        amountDiff: "AI",
        description: `Keep logging your transactions this month. The AI will unlock powerful comparative insights next month!`,
        trend: "neutral"
      });
    } else if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: "no-data",
        type: "Account Insights",
        color: "blue",
        icon: /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Lightbulb, null),
        title: "No Recent Insights",
        amountDiff: `${currencySymbol}0`,
        description: `Add more transactions this month to generate AI insights.`,
        trend: "neutral",
        isHighlight: true
      });
    }
    return generatedInsights.sort((a, b) => (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0));
  }, [transactions, activeCurrency]);
  if (insights.length === 0) return null;
  const highlight = insights.find((i) => i.isHighlight) || insights[0];
  const otherInsights = insights.filter((i) => i.id !== highlight.id);
  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-500";
      case "red":
        return "from-red-500/20 to-rose-500/10 border-red-500/30 text-red-500";
      case "amber":
        return "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500";
      case "blue":
      default:
        return "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-500";
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3 mb-6" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl text-white shadow-lg shadow-purple-500/20" }, /* @__PURE__ */ import_react.default.createElement(import_lucide_react.Lightbulb, { size: 20 })), /* @__PURE__ */ import_react.default.createElement("h2", { className: "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-purple-500" }, "Finance Intelligence")), /* @__PURE__ */ import_react.default.createElement("div", { className: `glass-panel rounded-3xl p-1 relative overflow-hidden mb-6 group` }, /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent opacity-50" }), /* @__PURE__ */ import_react.default.createElement("div", { className: `relative bg-gradient-to-br ${getColorClasses(highlight.color).split(" ").slice(0, 2).join(" ")} border ${getColorClasses(highlight.color).split(" ")[2]} backdrop-blur-xl rounded-[22px] p-6 md:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 transition-all hover:bg-opacity-80` }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-4 flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: `p-4 rounded-2xl bg-[var(--background)] shadow-xl shrink-0 ${getColorClasses(highlight.color).split(" ")[3]}` }, highlight.icon), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs font-bold uppercase tracking-wider opacity-70 mb-1" }, "Highlight \u2022 ", highlight.type), /* @__PURE__ */ import_react.default.createElement("h3", { className: "text-xl md:text-2xl font-bold mb-2 flex flex-wrap items-center gap-3" }, highlight.title, /* @__PURE__ */ import_react.default.createElement("span", { className: `text-base md:text-lg font-bold px-3 py-1 rounded-full bg-[var(--background)] shadow-sm ${getColorClasses(highlight.color).split(" ")[3]}` }, highlight.amountDiff)), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-base md:text-lg opacity-80 leading-relaxed max-w-2xl" }, highlight.description))), /* @__PURE__ */ import_react.default.createElement(import_react_router_dom.Link, { to: "/analytics", className: "shrink-0 px-6 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold hover:scale-105 transition-transform shadow-xl w-full xl:w-auto text-center" }, "View Analysis"))), otherInsights.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x custom-scrollbar" }, otherInsights.map((insight) => /* @__PURE__ */ import_react.default.createElement("div", { key: insight.id, className: "snap-start shrink-0 w-72 md:w-80 glass-panel rounded-2xl p-5 border border-[var(--border)] hover:border-blue-500/30 transition-colors flex flex-col justify-between group" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: `p-3 rounded-xl bg-[var(--background)] shadow-sm ${getColorClasses(insight.color).split(" ")[3]}` }, insight.icon), /* @__PURE__ */ import_react.default.createElement("div", { className: `text-sm font-bold px-3 py-1 rounded-full bg-[var(--background)] shadow-sm border ${getColorClasses(insight.color).split(" ")[2]} ${getColorClasses(insight.color).split(" ")[3]}` }, insight.amountDiff)), /* @__PURE__ */ import_react.default.createElement("h4", { className: "font-bold text-lg mb-2" }, insight.title), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-sm opacity-70 leading-relaxed mb-4" }, insight.description)), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider opacity-40" }, insight.type)))));
}

// src/pages/Dashboard.jsx
var import_recharts = require("recharts");
var import_lucide_react2 = require("lucide-react");

// src/hooks/usePullToRefresh.js
var import_react2 = require("react");
var usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = (0, import_react2.useState)(false);
  const [pullProgress, setPullProgress] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
    let startY = 0;
    let isPulling = false;
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };
    const handleTouchMove = (e) => {
      if (!isPulling) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY > 0 && window.scrollY === 0) {
        const progress = Math.min(deltaY / 150, 1);
        setPullProgress(progress);
      }
    };
    const handleTouchEnd = async () => {
      if (!isPulling) return;
      isPulling = false;
      if (pullProgress > 0.8 && !isRefreshing) {
        setIsRefreshing(true);
        if (onRefresh) {
          await onRefresh();
        } else {
          await new Promise((res) => setTimeout(res, 1500));
        }
        setIsRefreshing(false);
      }
      setPullProgress(0);
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullProgress, isRefreshing, onRefresh]);
  return { isRefreshing, pullProgress };
};

// src/pages/Dashboard.jsx
var import_meta = {};
var socket = lookup2(`${import_meta.env.VITE_API_URL || "http://localhost:5000"}`);
var COLORS = ["#3b82f6", "#8b5cf6", "#f43f5e", "#10b981"];
var accounts = [
  { id: "all", name: "All Accounts", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Wallet, { size: 16 }) },
  { id: "icici", name: "ICICI Bank", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Building2, { size: 16 }) },
  { id: "sib", name: "South Indian Bank", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Landmark, { size: 16 }) },
  { id: "qatar_bank", name: "Qatar Bank", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Building2, { size: 16 }) },
  { id: "cash_inr", name: "Cash (Rupees)", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.DollarSign, { size: 16 }) },
  { id: "cash_qar", name: "Cash (Qatar Riyal)", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.DollarSign, { size: 16 }) },
  { id: "dues_inr", name: "Dues (Rupees)", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertCircle, { size: 16, className: "text-orange-500" }) },
  { id: "dues_qar", name: "Dues (Qatar Riyal)", icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertCircle, { size: 16, className: "text-orange-500" }) }
];
function Dashboard() {
  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 1e3));
  };
  const { isRefreshing, pullProgress } = usePullToRefresh(handleRefresh);
  const [flowMonth, setFlowMonth] = (0, import_react3.useState)((/* @__PURE__ */ new Date()).getMonth());
  const [flowYear, setFlowYear] = (0, import_react3.useState)((/* @__PURE__ */ new Date()).getFullYear());
  const [flowWeek, setFlowWeek] = (0, import_react3.useState)(1);
  const [transactions, setTransactions] = (0, import_react3.useState)([]);
  const [displayCurrency, setDisplayCurrency] = (0, import_react3.useState)("INR");
  const getGreeting = () => {
    try {
      const qatarTime = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Qatar" });
      const hour = new Date(qatarTime).getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    } catch {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    }
  };
  (0, import_react3.useEffect)(() => {
    fetch(`${import_meta.env.VITE_API_URL || "http://localhost:5000"}/api/transactions`).then((res) => res.json()).then((data) => setTransactions(Array.isArray(data) ? data : [])).catch((err) => console.error("Failed to load transactions", err));
    socket.on("transaction_added", (newTx) => {
      setTransactions((prev) => {
        if (prev.find((t) => t.id === newTx.id)) return prev;
        return [newTx, ...prev];
      });
    });
    socket.on("transaction_deleted", (id) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== parseInt(id)));
    });
    socket.on("transaction_updated", (updatedTx) => {
      setTransactions((prev) => prev.map((tx) => tx.id === updatedTx.id ? updatedTx : tx));
    });
    return () => {
      socket.off("transaction_added");
      socket.off("transaction_deleted");
      socket.off("transaction_updated");
    };
  }, []);
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedAccount === "all") return true;
    if (selectedAccount === "total_dues") return tx.type === "Dues";
    if (selectedAccount === "total_debt") return tx.type === "Debt";
    if (selectedAccount === "total_cash") return tx.mode === "Cash (Rupees)" || tx.mode === "Cash (Qatar Riyal)";
    const accDef = accounts.find((a) => a.id === selectedAccount);
    return accDef ? tx.mode === accDef.name || tx.mode === `UPI (${accDef.name})` : false;
  });
  const getBalance = (accountName) => {
    const isQarAccount = accountName.includes("Qatar");
    return transactions.filter(
      (tx) => tx.mode === accountName || tx.mode === `UPI (${accountName})` || tx.type === "Debt" && (isQarAccount ? isQAR(tx) : !isQAR(tx))
    ).reduce((acc, tx) => {
      if (tx.type === "Income" && (tx.mode === accountName || tx.mode === `UPI (${accountName})`)) return acc + tx.amount;
      if (tx.type === "Expense" && (tx.mode === accountName || tx.mode === `UPI (${accountName})`)) return acc - tx.amount;
      if (tx.type === "Debt") return acc - tx.amount;
      if (tx.type === "Dues" && tx.includeInBalance && (tx.mode === accountName || tx.mode === `UPI (${accountName})`)) {
        if (tx.dueAction === "add") return acc - tx.amount;
        if (tx.dueAction === "settle") return acc + tx.amount;
      }
      return acc;
    }, 0);
  };
  const getDuesBalance = (currency) => {
    return transactions.filter((tx) => tx.type === "Dues" && tx.dueCurrency === currency).reduce((acc, tx) => {
      if (tx.dueAction === "add") return acc + tx.amount;
      if (tx.dueAction === "settle") return acc - tx.amount;
      return acc;
    }, 0);
  };
  const getDebtBalance = (currency) => {
    return transactions.filter((tx) => tx.type === "Debt" && (currency === "QAR" ? isQAR(tx) : !isQAR(tx))).reduce((acc, tx) => acc + tx.amount, 0);
  };
  const isQAR = (tx) => tx.mode?.includes("Qatar") || tx.dueCurrency === "QAR";
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const isCurrentMonth = (dateStr) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };
  const totalIncomeINR = filteredTransactions.filter((t) => t.type === "Income" && !isQAR(t) && isCurrentMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const totalExpensesINR = filteredTransactions.filter((t) => t.type === "Expense" && !isQAR(t) && isCurrentMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const totalBalanceINR = filteredTransactions.filter((t) => !isQAR(t)).reduce((acc, tx) => {
    if (tx.type === "Income") return acc + tx.amount;
    if (tx.type === "Expense") return acc - tx.amount;
    if (tx.type === "Debt") return acc - tx.amount;
    return acc;
  }, 0);
  const totalIncomeQAR = filteredTransactions.filter((t) => t.type === "Income" && isQAR(t) && isCurrentMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const totalExpensesQAR = filteredTransactions.filter((t) => t.type === "Expense" && isQAR(t) && isCurrentMonth(t.date)).reduce((s, t) => s + t.amount, 0);
  const totalBalanceQAR = filteredTransactions.filter((t) => isQAR(t)).reduce((acc, tx) => {
    if (tx.type === "Income") return acc + tx.amount;
    if (tx.type === "Expense") return acc - tx.amount;
    if (tx.type === "Debt") return acc - tx.amount;
    return acc;
  }, 0);
  const totalDuesAddedINR = filteredTransactions.filter((t) => t.type === "Dues" && t.dueAction === "add" && !isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalDuesSettledINR = filteredTransactions.filter((t) => t.type === "Dues" && t.dueAction === "settle" && !isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalDuesAddedQAR = filteredTransactions.filter((t) => t.type === "Dues" && t.dueAction === "add" && isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalDuesSettledQAR = filteredTransactions.filter((t) => t.type === "Dues" && t.dueAction === "settle" && isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const activeDisplayCurrency = ["icici", "sib", "cash_inr"].includes(selectedAccount) ? "INR" : ["cash_qar", "qatar_bank"].includes(selectedAccount) ? "QAR" : displayCurrency;
  const currentTotalIncome = activeDisplayCurrency === "QAR" ? totalIncomeQAR : totalIncomeINR;
  const currentTotalExpenses = activeDisplayCurrency === "QAR" ? totalExpensesQAR : totalExpensesINR;
  const currentTotalDuesAdded = activeDisplayCurrency === "QAR" ? totalDuesAddedQAR : totalDuesAddedINR;
  const currentTotalDuesSettled = activeDisplayCurrency === "QAR" ? totalDuesSettledQAR : totalDuesSettledINR;
  const duesBalanceINR = totalDuesAddedINR - totalDuesSettledINR;
  const duesBalanceQAR = totalDuesAddedQAR - totalDuesSettledQAR;
  const healthScore = currentTotalIncome === 0 && currentTotalExpenses === 0 ? 0 : currentTotalIncome === 0 ? 0 : Math.max(0, Math.round((currentTotalIncome - currentTotalExpenses) / currentTotalIncome * 100));
  const duesHealthScore = currentTotalDuesAdded === 0 ? 100 : Math.round(currentTotalDuesSettled / currentTotalDuesAdded * 100);
  const showINR = ["all", "icici", "sib", "cash_inr", "total_dues", "total_debt", "total_cash"].includes(selectedAccount);
  const showQAR = ["all", "cash_qar", "qatar_bank", "total_dues", "total_debt", "total_cash"].includes(selectedAccount);
  const displayTransactions = filteredTransactions.filter(
    (t) => activeDisplayCurrency === "QAR" ? isQAR(t) : !isQAR(t)
  );
  const renderCurrencyAmount = (amountINR, amountQAR) => /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex gap-2 items-baseline select-none" }, showINR && /* @__PURE__ */ import_react3.default.createElement(
    "span",
    {
      onClick: () => showQAR && setDisplayCurrency("INR"),
      className: `transition-all ${!showQAR || activeDisplayCurrency === "INR" ? "text-2xl lg:text-3xl font-bold" : "text-base opacity-50 hover:opacity-80 cursor-pointer"}`
    },
    "\u20B9",
    amountINR.toLocaleString()
  ), showINR && showQAR && /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-base opacity-50" }, "|"), showQAR && /* @__PURE__ */ import_react3.default.createElement(
    "span",
    {
      onClick: () => showINR && setDisplayCurrency("QAR"),
      className: `transition-all ${!showINR || activeDisplayCurrency === "QAR" ? "text-2xl lg:text-3xl font-bold" : "text-base opacity-50 hover:opacity-80 cursor-pointer"}`
    },
    "QAR ",
    amountQAR.toLocaleString()
  ));
  const expensesByCategory = displayTransactions.filter((t) => {
    if (!isCurrentMonth(t.date)) return false;
    if (selectedAccount === "total_dues") return t.type === "Dues" && t.dueAction === "add";
    if (selectedAccount === "total_debt") return t.type === "Debt";
    return t.type === "Expense";
  }).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const categoryData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[index % COLORS.length]
  }));
  const flowByDate = {};
  const daysInFlowMonth = new Date(flowYear, flowMonth + 1, 0).getDate();
  for (let i = 1; i <= daysInFlowMonth; i++) {
    const k = `${flowYear}-${String(flowMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    flowByDate[k] = { date: k, Income: 0, Expense: 0, Dues: 0, Debt: 0 };
  }
  displayTransactions.forEach((t) => {
    let key = t.date || "";
    if (key.substring(0, 7) !== `${flowYear}-${String(flowMonth + 1).padStart(2, "0")}`) return;
    if (!flowByDate[key]) flowByDate[key] = { date: key, Income: 0, Expense: 0, Dues: 0, Debt: 0 };
    if (selectedAccount === "total_dues") {
      if (t.type === "Dues" && t.dueAction === "settle") flowByDate[key].Income += t.amount;
      if (t.type === "Dues" && t.dueAction === "add") flowByDate[key].Expense += t.amount;
    } else if (selectedAccount === "total_debt") {
      if (t.type === "Debt") flowByDate[key].Income += t.amount;
    } else {
      if (t.type === "Income") flowByDate[key].Income += t.amount;
      if (t.type === "Expense") flowByDate[key].Expense += t.amount;
      if (t.type === "Dues" && t.dueAction === "add") flowByDate[key].Dues += t.amount;
      if (t.type === "Debt") flowByDate[key].Debt += t.amount;
    }
  });
  const fullFlowData = Object.values(flowByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  const flowData = fullFlowData.slice((flowWeek - 1) * 7, flowWeek * 7);
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar pb-24 relative" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute top-0 w-full flex justify-center z-50 pointer-events-none", style: { transform: `translateY(${Math.max(0, pullProgress * 50 - 50)}px)` } }, /* @__PURE__ */ import_react3.default.createElement("div", { className: `bg-[var(--card)] p-2 rounded-full shadow-lg transition-transform ${isRefreshing ? "animate-spin" : ""}`, style: { opacity: pullProgress } }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.RefreshCw, { size: 20, className: "text-blue-500" }))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto transition-transform", style: { transform: `translateY(${isRefreshing ? 50 : pullProgress * 50}px)` } }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex justify-between items-center mb-6 md:mb-8 mt-2 md:mt-0" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h1", { className: "text-sm font-bold opacity-60 uppercase tracking-widest mb-1" }, getGreeting()), /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-2xl md:text-4xl font-black tracking-tight" }, "Adon")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "md:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] shadow-lg shadow-blue-500/20" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-full h-full rounded-full bg-[var(--background)] overflow-hidden" }, /* @__PURE__ */ import_react3.default.createElement("img", { src: "https://ui-avatars.com/api/?name=Adon&background=random", alt: "Profile", className: "w-full h-full object-cover" })))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex gap-3 overflow-x-auto pb-6 xl:pb-8 w-full custom-scrollbar-x min-w-0 snap-x" }, accounts.filter((a) => !a.id.startsWith("dues_") && !a.id.startsWith("cash_")).map((acc) => /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, { key: acc.id }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: () => setSelectedAccount(acc.id),
      className: `snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-semibold border ${selectedAccount === acc.id ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" : "glass border-[var(--border)] hover:bg-[var(--card)] opacity-80 hover:opacity-100"}`
    },
    acc.icon,
    acc.name
  ), acc.id === "all" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: () => setSelectedAccount("total_dues"),
      className: `snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === "total_dues" ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30" : "border-red-500/30 bg-red-500/5 text-red-500 shadow-lg shadow-red-500/10"}`
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertCircle, { size: 16 }),
    "Total Dues: \u20B9",
    getDuesBalance("INR").toLocaleString(),
    " | QAR ",
    getDuesBalance("QAR").toLocaleString()
  ), /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: () => setSelectedAccount("total_debt"),
      className: `snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === "total_debt" ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "border-indigo-500/30 bg-indigo-500/5 text-indigo-500 shadow-lg shadow-indigo-500/10"}`
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertCircle, { size: 16 }),
    "Total Debt: \u20B9",
    getDebtBalance("INR").toLocaleString(),
    " | QAR ",
    getDebtBalance("QAR").toLocaleString()
  ), /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: () => setSelectedAccount("total_cash"),
      className: `snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === "total_cash" ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30" : "border-green-500/30 bg-green-500/5 text-green-500 shadow-lg shadow-green-500/10"}`
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.DollarSign, { size: 16 }),
    "Total Cash: \u20B9",
    getBalance("Cash (Rupees)").toLocaleString(),
    " | QAR ",
    getBalance("Cash (Qatar Riyal)").toLocaleString()
  ))))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 custom-scrollbar-x w-full md:grid md:grid-cols-4 md:overflow-visible" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "snap-center w-[85vw] md:w-auto flex-1 shrink-0 pl-4 md:pl-0" }, /* @__PURE__ */ import_react3.default.createElement(
    SummaryCard,
    {
      title: selectedAccount === "total_dues" ? "Total Dues" : "Total Balance",
      amount: selectedAccount === "total_dues" ? renderCurrencyAmount(totalDuesAddedINR, totalDuesAddedQAR) : renderCurrencyAmount(totalBalanceINR, totalBalanceQAR),
      trend: "Healthy",
      isPositive: true,
      icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.DollarSign, null)
    }
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "snap-center w-[85vw] md:w-auto flex-1 shrink-0" }, /* @__PURE__ */ import_react3.default.createElement(
    SummaryCard,
    {
      title: selectedAccount === "total_dues" ? "Settled Dues" : "Total Income",
      amount: selectedAccount === "total_dues" ? renderCurrencyAmount(totalDuesSettledINR, totalDuesSettledQAR) : renderCurrencyAmount(totalIncomeINR, totalIncomeQAR),
      trend: "Recent",
      isPositive: true,
      icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.TrendingUp, null)
    }
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "snap-center w-[85vw] md:w-auto flex-1 shrink-0" }, /* @__PURE__ */ import_react3.default.createElement(
    SummaryCard,
    {
      title: selectedAccount === "total_dues" ? "Balance Dues to be Settled" : "Total Expenses",
      amount: selectedAccount === "total_dues" ? renderCurrencyAmount(duesBalanceINR, duesBalanceQAR) : renderCurrencyAmount(totalExpensesINR, totalExpensesQAR),
      trend: "Recent",
      isPositive: false,
      icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.TrendingDown, null)
    }
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "snap-center w-[85vw] md:w-auto flex-1 shrink-0 pr-4 md:pr-0" }, /* @__PURE__ */ import_react3.default.createElement(
    SummaryCard,
    {
      title: "Health Score",
      amount: selectedAccount === "total_dues" ? `${duesHealthScore}/100` : `${healthScore}/100`,
      trend: selectedAccount === "total_dues" ? duesHealthScore > 50 ? "Good" : "Needs Work" : healthScore > 50 ? "Good" : "Needs Work",
      isPositive: selectedAccount === "total_dues" ? duesHealthScore > 50 : healthScore > 50,
      icon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.DollarSign, null)
    }
  ))), /* @__PURE__ */ import_react3.default.createElement(FinancialInsights, { transactions, activeCurrency: activeDisplayCurrency }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "lg:col-span-2 glass-panel rounded-3xl p-6" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-xl font-semibold" }, "Cash Flow"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex gap-2 items-center" }, /* @__PURE__ */ import_react3.default.createElement(
    "select",
    {
      value: flowMonth,
      onChange: (e) => {
        setFlowMonth(Number(e.target.value));
        setFlowWeek(1);
      },
      className: "bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500 text-[var(--foreground)]"
    },
    Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(flowYear, i, 1);
      return /* @__PURE__ */ import_react3.default.createElement("option", { key: i, value: i }, d.toLocaleString("default", { month: "short" }));
    })
  ), /* @__PURE__ */ import_react3.default.createElement(
    "select",
    {
      value: flowWeek,
      onChange: (e) => setFlowWeek(Number(e.target.value)),
      className: "bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500 text-[var(--foreground)]"
    },
    Array.from({ length: Math.max(1, Math.ceil((fullFlowData?.length || 0) / 7)) }).map((_, i) => /* @__PURE__ */ import_react3.default.createElement("option", { key: i + 1, value: i + 1 }, "W", i + 1))
  ), /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-sm font-bold opacity-50 ml-2" }, activeDisplayCurrency === "INR" ? "\u20B9 Rupees" : "QAR Riyal"))), flowData.length > 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "h-80 w-full" }, /* @__PURE__ */ import_react3.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react3.default.createElement(import_recharts.AreaChart, { data: flowData, margin: { top: 10, right: 30, left: 0, bottom: 0 } }, /* @__PURE__ */ import_react3.default.createElement("defs", null, /* @__PURE__ */ import_react3.default.createElement("linearGradient", { id: "colorIncome", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }), /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })), /* @__PURE__ */ import_react3.default.createElement("linearGradient", { id: "colorExpense", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "5%", stopColor: "#f43f5e", stopOpacity: 0.3 }), /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "95%", stopColor: "#f43f5e", stopOpacity: 0 })), /* @__PURE__ */ import_react3.default.createElement("linearGradient", { id: "colorDues", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "5%", stopColor: "#f97316", stopOpacity: 0.3 }), /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "95%", stopColor: "#f97316", stopOpacity: 0 })), /* @__PURE__ */ import_react3.default.createElement("linearGradient", { id: "colorDebt", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.3 }), /* @__PURE__ */ import_react3.default.createElement("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 }))), /* @__PURE__ */ import_react3.default.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "rgba(255,255,255,0.1)" }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.XAxis, { dataKey: "date", stroke: "rgba(255,255,255,0.5)", tick: { fill: "rgba(255,255,255,0.5)" }, axisLine: false, tickLine: false }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.YAxis, { stroke: "rgba(255,255,255,0.5)", tick: { fill: "rgba(255,255,255,0.5)" }, axisLine: false, tickLine: false }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ import_react3.default.createElement(DashboardCustomTooltip, { activeDisplayCurrency }) }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Income", name: "Cash Earned", stroke: "#10b981", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorIncome)" }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Expense", name: "Cash Spent", stroke: "#f43f5e", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorExpense)" }), selectedAccount !== "total_dues" && selectedAccount !== "total_debt" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Dues", name: "Dues Added", stroke: "#f97316", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorDues)" }), /* @__PURE__ */ import_react3.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Debt", name: "Debt Added", stroke: "#6366f1", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorDebt)" }))))) : /* @__PURE__ */ import_react3.default.createElement("div", { className: "h-80 w-full flex items-center justify-center text-sm opacity-50" }, "No transaction data available for chart.")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "glass-panel rounded-3xl p-6 flex flex-col items-center" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex justify-between items-center mb-6 w-full" }, /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-xl font-semibold" }, selectedAccount === "total_dues" ? "Dues by Category" : selectedAccount === "total_debt" ? "Debt by Category" : "Expenses by Category"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-sm font-bold opacity-50" }, activeDisplayCurrency === "INR" ? "\u20B9 Rupees" : "QAR Riyal")), categoryData.length > 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "h-64 w-full relative flex flex-col items-center justify-center" }, /* @__PURE__ */ import_react3.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react3.default.createElement(import_recharts.PieChart, null, /* @__PURE__ */ import_react3.default.createElement(
    import_recharts.Pie,
    {
      data: categoryData,
      cx: "50%",
      cy: "50%",
      innerRadius: 60,
      outerRadius: 80,
      paddingAngle: 5,
      dataKey: "value",
      stroke: "none"
    },
    categoryData.map((entry, index) => /* @__PURE__ */ import_react3.default.createElement(import_recharts.Cell, { key: `cell-${index}`, fill: entry.color }))
  ), /* @__PURE__ */ import_react3.default.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ import_react3.default.createElement(PieCustomTooltip, { activeDisplayCurrency, totalExpensesINR, totalExpensesQAR }) }))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-2xl font-bold" }, activeDisplayCurrency === "INR" ? "\u20B9" : "QAR ", (activeDisplayCurrency === "INR" ? totalExpensesINR : totalExpensesQAR).toLocaleString()), /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-xs opacity-50" }, "Total"))) : /* @__PURE__ */ import_react3.default.createElement("div", { className: "h-64 w-full relative flex items-center justify-center text-sm opacity-50" }, "No category data available yet.")))));
}
var DashboardCustomTooltip = ({ active, payload, label, activeDisplayCurrency }) => {
  if (active && payload && payload.length) {
    const incomeObj = payload.find((p) => p.dataKey === "Income");
    const expensesObj = payload.find((p) => p.dataKey === "Expense");
    const income = incomeObj ? incomeObj.value : 0;
    const expenses = expensesObj ? expensesObj.value : 0;
    let spendingPercentage = 0;
    if (income > 0) {
      spendingPercentage = Math.round(expenses / income * 100);
    } else if (expenses > 0) {
      spendingPercentage = 100;
    }
    let colorClass = "text-green-500";
    if (spendingPercentage > 60) {
      colorClass = "text-red-500";
    } else if (spendingPercentage > 30) {
      colorClass = "text-orange-500";
    }
    return /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "font-bold mb-2 text-[var(--foreground)]" }, label), payload.map((entry, index) => /* @__PURE__ */ import_react3.default.createElement("p", { key: index, style: { color: entry.color }, className: "text-sm font-medium" }, entry.name, ": ", activeDisplayCurrency === "INR" ? "\u20B9" : "QAR ", entry.value.toLocaleString())), /* @__PURE__ */ import_react3.default.createElement("p", { className: `text-sm font-bold mt-2 pt-2 border-t border-[var(--border)] ${colorClass}` }, "Spending: ", income === 0 && expenses > 0 ? "> 100" : spendingPercentage, "%"));
  }
  return null;
};
var PieCustomTooltip = ({ active, payload, activeDisplayCurrency, totalExpensesINR, totalExpensesQAR }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = activeDisplayCurrency === "INR" ? totalExpensesINR : totalExpensesQAR;
    const percentage = total > 0 ? Math.round(data.value / total * 100) : 0;
    return /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-lg" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "font-bold text-[var(--foreground)] flex items-center gap-2" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: data.color } }), data.name), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm mt-1" }, activeDisplayCurrency === "INR" ? "\u20B9" : "QAR ", data.value.toLocaleString()), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm font-bold text-slate-500 mt-1" }, percentage, "% of Total Expenses"));
  }
  return null;
};
function SummaryCard({ title, amount, trend, isPositive, icon }) {
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "glass-panel rounded-3xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500" }, import_react3.default.cloneElement(icon, { size: 100 })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: `p-2 rounded-xl ${isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}` }, icon), /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-sm opacity-70 font-medium" }, title)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "font-bold tracking-tight mb-2" }, amount), /* @__PURE__ */ import_react3.default.createElement("div", { className: `text-sm font-semibold flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}` }, isPositive ? /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.TrendingUp, { size: 16 }) : /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.TrendingDown, { size: 16 }), trend));
}
