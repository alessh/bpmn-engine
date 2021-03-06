'use strict';

const Flow = require('./Flow');
const scriptHelper = require('../script-helper');
const util = require('util');

const internals = {};

module.exports = internals.Flow = function(activity) {
  this.condition = getCondition.call(this, activity.element);
  Flow.apply(this, arguments);
  this.isDefault = this.parentContext.isDefaultSequenceFlow(this.id);
};

util.inherits(internals.Flow, Flow);

internals.Flow.prototype.take = function() {
  let taken = true;
  if (this.condition) {
    taken = this.executeCondition(this.parentContext.variables);
  }

  if (!taken) {
    return this.discard();
  }

  return Flow.prototype.take.apply(this, arguments);
};

internals.Flow.prototype.executeCondition = function(variables) {
  const result = scriptHelper.execute(this.condition, variables);
  this._debug(`<${this.id}>`, `condition result evaluated to ${result}`, variables);
  return result;
};

function getCondition(element) {
  if (!element.conditionExpression) return null;

  if (!scriptHelper.isJavascript(element.conditionExpression.language)) throw Error(`Script format ${element.conditionExpression.language} is unsupported (<${element.id}>)`);

  return scriptHelper.parse(`${element.id}.condition`, element.conditionExpression.body);
}
