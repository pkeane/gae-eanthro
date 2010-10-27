#!/usr/bin/env python

import datetime
import os
import random
import re
import string
import sys
import urllib
import urlparse
import wsgiref.handlers

import time

from google.appengine.api import urlfetch
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import login_required

# Set to true if we want to have our webapp print stack traces, etc
_DEBUG = True

def create_openid_url(continue_url):
    #continue_url = urlparse.urljoin(request.url, continue_url)
    return "/_ah/login_required?continue=%s" % urllib.quote(continue_url)

def rfc3339():
    """
    Format a date the way Atom likes it (RFC3339)
    """
    return time.strftime('%Y-%m-%dT%H:%M:%S%z')

class Item(db.Model):
  name = db.StringProperty(required=True)
  text = db.TextProperty()
  created = db.DateTimeProperty(auto_now_add=True)
  updated = db.DateTimeProperty(auto_now=True)

class BaseRequestHandler(webapp.RequestHandler):
  """Supplies a common template generation function.

  When you call generate(), we augment the template variables supplied with
  the current user in the 'user' variable and the current webapp request
  in the 'request' variable.
  """
  def generate(self, template_name, template_values={}):
    values = {
      'request': self.request,
      'user': users.GetCurrentUser(),
      'login_url': users.CreateLoginURL(self.request.uri),
      'logout_url': users.CreateLogoutURL('http://' + self.request.host + '/'),
      'app_root': 'http://' + self.request.host + '/',
      'debug': self.request.get('deb'),
      'msg': self.request.get('msg'),
      'application_name': 'meta-box',
    }
    values.update(template_values)
    directory = os.path.dirname(__file__)
    path = os.path.join(directory, os.path.join('templates', template_name))
    self.response.out.write(template.render(path, values, debug=_DEBUG))

class HomeHandler(BaseRequestHandler):
  @login_required
  def get(self):
      user = users.GetCurrentUser()
      self.generate('home.html')

class ItemsHandler(BaseRequestHandler):
  """Lists the items """

  @login_required
  def get(self):
      user = users.GetCurrentUser()
      cache=False
      items = db.GqlQuery("SELECT * from Item ORDER BY created")
      self.generate('items.html', {
          'items': items,
      })

  def post(self):
      name = self.request.get('name')
      text = self.request.get('text')
      if (name and text):
          item = Item(name=name,text=text)
          item.put()
      self.redirect('items')

class IndexHandler(BaseRequestHandler):
  def get(self):
      self.generate('index.html')

class ItemHandler(BaseRequestHandler):
  def delete(self,key=''):
      item = Item.get(key);
      item.delete()
  def get(self,key=''):
      item = Item.get(key);
      self.response.headers['Content-Type'] = 'application/json'
      self.response.out.write(item.to_xml())
  def put(self,key=''):
      pass

class FootprintsHandler(BaseRequestHandler):
  def get(self,key=''):
      self.generate('footprints.html')

class FootprintsFormHandler(BaseRequestHandler):
  def get(self,key=''):
      self.generate('footprints_form.html')
  def post(self):
      self.redirect('/exercise/footprints/graph')

class FootprintsGraphHandler(BaseRequestHandler):
  def get(self,key=''):
      self.generate('footprints_graph.html')

def main():
  application = webapp.WSGIApplication([
    ('/', HomeHandler),
    ('/items', ItemsHandler),
    ('/item/(.*)', ItemHandler),
    ('/exercise/footprints', FootprintsHandler),
    ('/exercise/footprints/form', FootprintsFormHandler),
    ('/exercise/footprints/graph', FootprintsGraphHandler),
  ], debug=_DEBUG)
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()
