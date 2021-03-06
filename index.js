var packageData = require('./package.json')
var userValidate = require('npm-user-validate')

var MockTransport = function (options) {
  this.options = options || { errorOnSend: false }
  this.sentMail = []
  this.name = 'Mock'
  this.version = packageData.version
}

function validate (addr) {
  try {
    var err = userValidate.email(addr)
    if (err != null) return err
  } catch (_err) {
    return new Error('Error validating address.')
  }
  return null
}

MockTransport.prototype.send = function (mail, callback) {
  var err

  if (!mail.data.to) {
    return callback(new Error('I need to know who this email is being sent to :-('))
  }

  if (Array.isArray(mail.data.to)) {
    for (var i = 0; i < mail.data.to.length; i++) {
      var addr = mail.data.to[i]
      err = validate(addr)
      if (err != null) {
        return callback(err)
      }
    }
  } else {
    err = validate(mail.data.to)
    if (err != null || (err = this.options.errorOnSend)) {
      return callback(err)
    }
  }

  this.sentMail.push(mail)
  return callback(null, { envelope:
            { from: mail.data.from,
            to: [ mail.data.to ] },
            messageId: '<0100016145484735-9acb1318-25f7-4890-9def-8f5e6afe5545-000000@some.tld.com>',
            response: '0100016145484735-9acb1318-25f7-4890-9def-8f5e6afe5545-000000'
          })
}

module.exports = function (options) {
  return new MockTransport(options)
}
