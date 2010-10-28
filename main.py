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

def rfc3339():
    """
    Format a date the way Atom likes it (RFC3339)
    """
    return time.strftime('%Y-%m-%dT%H:%M:%S%z')

class PersonData(db.Model):
  gender = db.StringProperty(required=True)
  age = db.IntegerProperty(required=True)
  foot_length = db.IntegerProperty(required=True)
  height = db.IntegerProperty(required=True)
  stride_length = db.IntegerProperty(required=False)
  created = db.DateTimeProperty(auto_now_add=True)
  created_by = db.UserProperty(required=True) 

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
      'application_name': 'eanthro',
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
      pd = PersonData.get(key);
      pd.delete()
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
      cache=False
      items = db.GqlQuery(
              "SELECT * from PersonData " +
              "WHERE created_by = :1 " + 
              "ORDER BY created",users.GetCurrentUser())
      self.generate('footprints_form.html', {
          'items': items,
      })
  def post(self):
      gender = self.request.get('gender')
      age = int(self.request.get('age'))
      foot_length = int(self.request.get('foot_length'))
      stride_length = int(self.request.get('stride_length'))
      height = int(self.request.get('height'))
      if (gender and age and foot_length and height):
          pd = PersonData(
                  created_by = users.GetCurrentUser(),
                  gender=gender,
                  age=age,
                  foot_length=foot_length,
                  stride_length=stride_length,
                  height=height
                  )
          pd.put()
      self.redirect('/exercise/footprints/form')

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
