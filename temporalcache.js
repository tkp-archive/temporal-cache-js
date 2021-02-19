/* ***************************************************************************
 *
 * Copyright (c) 2021, the temporal-cache-js authors.
 *
 * This file is part of the temporal-cache-js library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
function TCException(message) {
  const error = new Error(message);
  return error;
}

TCException.prototype = Object.create(Error.prototype);

const toProperCase = (st) =>
  st.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );

let TEMPORAL_CACHE_GLOBAL_DISABLE = false;

const disable = () => {
  TEMPORAL_CACHE_GLOBAL_DISABLE = true;
};
const enable = () => {
  TEMPORAL_CACHE_GLOBAL_DISABLE = false;
};

/**
 * @param {date} last last datetime
 * @param {date} now current datetime
 * @param {string} lap at what point to "roll over"
 * @param {number} offset how many seconds between laps
 * @param {number} multiple what to multiply attr by to get seconds
 * @param {string} attr attribute to interrogate, in {seconds, minutes, hours, date (for day), month, year}
 */
const _base = (last, now, lap, offset, multiple, attr) => {
  // last started before :X, so if now > :X
  const now_ts = now.getTime() / 1000;
  const last_ts = last.getTime() / 1000;
  const diff = Math.round(now_ts) - Math.round(last_ts);
  const properAttrValLast = last[`get${toProperCase(attr)}`]();
  const properAttrValNow = now[`get${toProperCase(attr)}`]();
  const min_gap = offset - properAttrValLast * multiple;

  if (diff > offset) return true;
  if (properAttrValLast < lap) {
    if (properAttrValNow >= lap) return true;
    return false;
  }
  if (properAttrValNow >= lap && diff >= min_gap) {
    // last started after :X, so if now > last + interval, or if now > :X
    return true;
  }
  return false;
};

const _secondly = (last, now, secondly) =>
  _base(last, now, secondly, 60, 1, "seconds");
const _minutely = (last, now, minutely) =>
  _base(last, now, minutely, 3600, 60, "minutes");
const _hourly = (last, now, hourly) =>
  _base(last, now, hourly, 3600 * 24, 3600, "hours");
const _daily = (last, now, daily) =>
  _base(last, now, daily, 3600 * 24 * 30, 3600 * 24, "date");
const _day_of_week = (last, now, day_of_week) =>
  _base(last, now, day_of_week, 3600 * 24 * 7, 3600 * 24, "day");

// TODO
// const _weekly = (last, now, weekly) => _base(last, now, weekly, 3600 * 24 * 7 * 4.34, 3600 * 24 * 7, "week");

const _monthly = (last, now, monthly) =>
  _base(last, now, monthly, 3600 * 24 * 365, 3600 * 24 * 7 * 4.34, "month");

/**
 * Should the cache expire?
 * @param {date} last
 * @param {date} now
 * @param {number} secondly
 * @param {number} minutely
 * @param {number} hourly
 * @param {number} daily
 * @param {number} day_of_week
 * @param {number} weekly
 * @param {number} monthly
 * @returns
 */
const should_expire = (
  last,
  now,
  secondly,
  minutely,
  hourly,
  daily,
  day_of_week,
  weekly,
  monthly,
) =>
  [
    secondly ? _secondly(last, now, secondly) : true,
    minutely ? _minutely(last, now, minutely) : true,
    hourly ? _hourly(last, now, hourly) : true,
    daily ? _daily(last, now, daily) : true,
    day_of_week ? _day_of_week(last, now, day_of_week) : true,
    // weekly ? _weekly(last, now, weekly) : true, // TODO
    monthly ? _monthly(last, now, monthly) : true,
  ].every((v) => v === true);

/**
 * Calculate time elapsed
 * @param {object} options
 * @returns
 */
const calc = (options) => {
  const {
    seconds = 0,
    minutes = 0,
    hours = 0,
    days = 0,
    weeks = 0,
    months = 0,
    years = 0,
  } = options;
  return (
    seconds +
    minutes * 60 +
    hours * 60 * 60 +
    days * 24 * 60 * 60 +
    weeks * 7 * 24 * 60 * 60 +
    months * 30 * 7 * 24 * 60 * 60 +
    years * 365 * 24 * 60 * 60
  );
};

/**
 * Expires all entries in the cache @ whole number time
 * for example, expire(0, 30, 16)(...) will expire the cache at 4:30pm every day
 * @param {object} options
 */
const expire = (options) => {
  let { second = null } = options;
  const {
    minute = null,
    hour = null,
    day = null,
    day_of_week = null,
    week = null,
    month = null,
  } = options;

  if (![second, minute, hour, day, week, month].some((elem) => elem !== null)) {
    second = 0;
  }

  if (second && second >= 60) {
    throw new TCException("second must be < 60");
  }
  if (minute && minute >= 60) {
    throw new TCException("minute must be < 60");
  }

  if (hour && hour >= 24) {
    throw new TCException("minute must be < 24");
  }

  if (day && (day <= 0 || day > 31)) {
    throw new TCException("day must be > 0, < 32");
  }

  if (day_of_week && (day_of_week <= 0 || day_of_week > 8)) {
    throw new TCException("day_of_weel must be > 0, < 8");
  }

  if (week && (week <= 0 || week > 5)) {
    throw new TCException("day must be > 0, < 6");
  }

  if (month && (month <= 0 || month > 12)) {
    throw new TCException("month must be >0, < 13");
  }

  const _wrapper = (foo) => {
    const cache = new Map();
    let last = new Date();

    const _wrapped_function = (...args) => {
      const now = new Date();
      const key = JSON.stringify(args);
      if (
        !cache.has(key) ||
        should_expire(
          last,
          now,
          second,
          minute,
          hour,
          day,
          day_of_week,
          week,
          month,
        ) ||
        TEMPORAL_CACHE_GLOBAL_DISABLE
      ) {
        const val = foo(...args);
        cache.set(key, val);
      }
      last = now;
      return cache.get(key);
    };
    return _wrapped_function;
  };
  return _wrapper;
};

const expire_minutely = (on = 0) => (foo) => expire({ second: on })(foo);
const expire_hourly = (on = 0) => (foo) => expire({ minute: on })(foo);
const expire_daily = (on = 0) => (foo) => expire({ hour: on })(foo);
const expire_monthly = (on = 0) => (foo) => expire({ day: on })(foo);

/**
 * Expires all entries in the cache every interval
 * @param {object} options
 */
const interval = (options) => {
  let { seconds = 0 } = options;
  const {
    minutes = 0,
    hours = 0,
    days = 0,
    weeks = 0,
    months = 0,
    years = 0,
  } = options;

  if (
    ![seconds, minutes, hours, days, weeks, months, years].some(
      (elem) => elem !== 0,
    )
  ) {
    seconds = 1;
  }

  const _wrapper = (foo) => {
    let last = new Date(0);
    const cache = new Map();

    const _wrapped_function = (...args) => {
      const now = new Date();

      if (
        (now - last) / 1000 >
          calc({ seconds, minutes, hours, days, weeks, months, years }) ||
        TEMPORAL_CACHE_GLOBAL_DISABLE
      ) {
        const val = foo(...args);
        cache[args] = val;
      }
      last = now;
      return cache[args];
    };
    return _wrapped_function;
  };
  return _wrapper;
};

const interval_minutely = () => (foo) => interval({ seconds: 60 })(foo);
const interval_hourly = () => (foo) => interval({ minutes: 60 })(foo);
const interval_daily = () => (foo) => interval({ hours: 60 })(foo);
const interval_monthly = () => (foo) => interval({ months: 60 })(foo);

module.exports = {
  // utility
  TCException,
  should_expire,
  calc,
  TEMPORAL_CACHE_GLOBAL_DISABLE,
  enable,
  disable,
  // expire
  expire,
  expire_minutely,
  expire_hourly,
  expire_daily,
  expire_monthly,
  // interval
  interval,
  interval_minutely,
  interval_hourly,
  interval_daily,
  interval_monthly,
};
